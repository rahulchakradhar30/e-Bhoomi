export type DocumentLanguage = 'TELUGU' | 'ENGLISH' | 'MIXED_TE' | 'UNKNOWN';
export type LanguageDetectionSource = 'TEXT_HEURISTIC' | 'OCR_METADATA' | 'MODEL' | 'UNAVAILABLE';

export interface LanguageDetectionResult {
  detectedLanguage: DocumentLanguage;
  languageConfidence: number;
  detectionSource: LanguageDetectionSource;
  teluguCharRatio: number;
  englishCharRatio: number;
  reason: string;
}

export class LanguageDetector {
  public static detectLanguage(sampleText: string): LanguageDetectionResult {
    if (!sampleText || !sampleText.trim()) {
      return {
        detectedLanguage: 'UNKNOWN',
        languageConfidence: 0.0,
        detectionSource: 'UNAVAILABLE',
        teluguCharRatio: 0,
        englishCharRatio: 0,
        reason: 'Sample text is empty or missing.',
      };
    }

    const cleanText = sampleText.trim();
    let teluguChars = 0;
    let englishChars = 0;
    let totalAlpha = 0;

    for (let i = 0; i < cleanText.length; i++) {
      const code = cleanText.charCodeAt(i);
      // Telugu Unicode Block: U+0C00 to U+0C7F
      if (code >= 0x0c00 && code <= 0x0c7f) {
        teluguChars++;
        totalAlpha++;
      }
      // Basic Latin / English: A-Z, a-z
      else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        englishChars++;
        totalAlpha++;
      }
    }

    if (totalAlpha === 0) {
      return {
        detectedLanguage: 'UNKNOWN',
        languageConfidence: 0.5,
        detectionSource: 'TEXT_HEURISTIC',
        teluguCharRatio: 0,
        englishCharRatio: 0,
        reason: 'Text contains numbers/symbols without alphabetic characters.',
      };
    }

    const teRatio = teluguChars / totalAlpha;
    const enRatio = englishChars / totalAlpha;

    let lang: DocumentLanguage = 'UNKNOWN';
    let conf = 0.85;

    if (teRatio > 0.7) {
      lang = 'TELUGU';
      conf = Math.min(0.98, 0.85 + teRatio * 0.15);
    } else if (enRatio > 0.7) {
      lang = 'ENGLISH';
      conf = Math.min(0.98, 0.85 + enRatio * 0.15);
    } else if (teRatio > 0.2 && enRatio > 0.2) {
      lang = 'MIXED_TE';
      conf = 0.90;
    } else if (teRatio > 0) {
      lang = 'TELUGU';
      conf = 0.70;
    } else if (enRatio > 0) {
      lang = 'ENGLISH';
      conf = 0.70;
    }

    return {
      detectedLanguage: lang,
      languageConfidence: Math.round(conf * 100) / 100,
      detectionSource: 'TEXT_HEURISTIC',
      teluguCharRatio: Math.round(teRatio * 100) / 100,
      englishCharRatio: Math.round(enRatio * 100) / 100,
      reason: `Language detected as ${lang} (Telugu ratio: ${Math.round(teRatio * 100)}%, English ratio: ${Math.round(enRatio * 100)}%).`,
    };
  }
}
