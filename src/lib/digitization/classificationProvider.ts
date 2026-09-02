import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { ClassificationResult, ClassificationSignal } from '@/types/documentProcessingJob';

export interface ClassificationProvider {
  classifyDocument(
    fullText: string,
    vroSelectedType: DocumentCategoryCode,
    pageCount: number
  ): Promise<ClassificationResult>;
}

export class DefaultClassificationProvider implements ClassificationProvider {
  async classifyDocument(
    fullText: string,
    vroSelectedType: DocumentCategoryCode,
    pageCount: number
  ): Promise<ClassificationResult> {
    const textLower = fullText.toLowerCase();
    const signals: ClassificationSignal[] = [];

    const scores: Record<DocumentCategoryCode | 'UNKNOWN_OTHER', number> = {
      ADANGAL: 0,
      ROR_1B: 0,
      MUTATION: 0,
      PARTITION: 0,
      PASSBOOK: 0,
      LEGACY_REVENUE: 0,
      UNKNOWN_OTHER: 0.1,
    };

    // Signal 1: Heading Keyword Analysis
    if (textLower.includes('adangal') || textLower.includes('అడంగల్') || textLower.includes('cultivation record')) {
      scores.ADANGAL += 0.45;
      signals.push({
        signalType: 'TEXT_KEYWORD',
        name: 'Adangal Heading Match',
        weight: 0.45,
        description: 'Detected official village Adangal possession/cultivation keywords.',
      });
    }

    if (textLower.includes('ror') || textLower.includes('1b') || textLower.includes('1-b') || textLower.includes('హక్కుల రికార్డు')) {
      scores.ROR_1B += 0.48;
      signals.push({
        signalType: 'TEXT_KEYWORD',
        name: 'RoR-1B Heading Match',
        weight: 0.48,
        description: 'Detected Record of Rights (1-B) register keywords.',
      });
    }

    if (textLower.includes('mutation') || textLower.includes('మ్యూటేషన్') || textLower.includes('proceeding') || textLower.includes('title transfer')) {
      scores.MUTATION += 0.46;
      signals.push({
        signalType: 'TEXT_KEYWORD',
        name: 'Mutation Proceeding Keywords',
        weight: 0.46,
        description: 'Detected revenue proceeding title transfer keywords.',
      });
    }

    if (textLower.includes('partition') || textLower.includes('విభజన') || textLower.includes('succession') || textLower.includes('heir') || textLower.includes('share')) {
      scores.PARTITION += 0.47;
      signals.push({
        signalType: 'TEXT_KEYWORD',
        name: 'Partition Deed Keywords',
        weight: 0.47,
        description: 'Detected family partition and heir share keywords.',
      });
    }

    if (textLower.includes('passbook') || textLower.includes('పాస్బుక్') || textLower.includes('title deed') || textLower.includes('e-pattadar')) {
      scores.PASSBOOK += 0.44;
      signals.push({
        signalType: 'TEXT_KEYWORD',
        name: 'Passbook Keywords',
        weight: 0.44,
        description: 'Detected Pattadar Passbook / Title Deed serial keywords.',
      });
    }

    if (textLower.includes('legacy') || textLower.includes('inam') || textLower.includes('sethwar') || textLower.includes('fair adangal') || textLower.includes('1920')) {
      scores.LEGACY_REVENUE += 0.42;
      signals.push({
        signalType: 'TEXT_KEYWORD',
        name: 'Archival Legacy Keywords',
        weight: 0.42,
        description: 'Detected historical Inam register or Sethwar keywords.',
      });
    }

    // Signal 2: Layout / Structure Match
    if (textLower.includes('khata') || textLower.includes('ఖాతా')) {
      scores.ROR_1B += 0.2;
      scores.PASSBOOK += 0.15;
      signals.push({
        signalType: 'LAYOUT_STRUCTURE',
        name: 'Khata Structure Present',
        weight: 0.2,
        description: 'Detected Khata account table structure.',
      });
    }

    if (textLower.includes('east:') || textLower.includes('thoorpu') || textLower.includes('తూర్పు')) {
      scores.ADANGAL += 0.15;
      scores.PARTITION += 0.15;
      signals.push({
        signalType: 'TABLE_FORMAT',
        name: 'Four Side Boundary Layout',
        weight: 0.15,
        description: 'Detected directional land boundary formatting.',
      });
    }

    // Bias slightly towards VRO selection if keyword matches exist to represent context
    if (vroSelectedType && scores[vroSelectedType] > 0) {
      scores[vroSelectedType] += 0.25;
      signals.push({
        signalType: 'METADATA',
        name: 'VRO Context Prior',
        weight: 0.25,
        description: `VRO uploaded under expected category '${vroSelectedType}'.`,
      });
    }

    // Determine highest scoring candidate
    const sorted = (Object.keys(scores) as Array<DocumentCategoryCode | 'UNKNOWN_OTHER'>)
      .map((cat) => ({ type: cat, score: Math.min(1.0, parseFloat(scores[cat].toFixed(2))) }))
      .sort((a, b) => b.score - a.score);

    const topCandidate = sorted[0];
    const secondCandidate = sorted[1];

    let status: 'CONFIDENT' | 'NEEDS_REVIEW' | 'AMBIGUOUS' | 'FAILED' = 'CONFIDENT';
    let predicted: DocumentCategoryCode | 'UNKNOWN_OTHER' = topCandidate.type;

    if (topCandidate.score < 0.45) {
      predicted = 'UNKNOWN_OTHER';
      status = 'NEEDS_REVIEW';
    } else if (topCandidate.score - secondCandidate.score < 0.1) {
      status = 'AMBIGUOUS';
    }

    return {
      predictedType: predicted,
      confidenceScore: topCandidate.score,
      candidateTypes: sorted.slice(0, 3),
      classificationStatus: status,
      supportingSignals: signals,
      classifiedAt: new Date().toISOString(),
    };
  }
}
