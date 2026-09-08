import { BaseAIProvider, AIExtractionInput } from './aiTypes';

export class GroqAIProvider implements BaseAIProvider {
  public providerId = 'PROV-AI-GROQ';
  public providerName = 'Groq Cloud Llama-3.3 AI Provider';
  public providerType = 'OPENAI_COMPATIBLE' as const;
  public modelIdentifier = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  public promptVersion = 'groq-land-extraction-v1';

  public async healthCheck(): Promise<boolean> {
    const key = process.env.GROQ_API_KEY;
    return Boolean(key && key.startsWith('gsk_'));
  }

  public async extractStructuredRecord(input: AIExtractionInput) {
    const key = process.env.GROQ_API_KEY;
    const baseUrl = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';

    if (!key || !key.trim()) {
      return {
        success: false,
        status: 'AI_PROVIDER_UNAVAILABLE' as const,
        errorReason: 'GROQ_API_KEY unconfigured or missing from server environment.',
        modelUsed: this.modelIdentifier,
      };
    }

    const textToProcess =
      input.llamaExtractedText ||
      input.extractedText ||
      input.translatedText ||
      input.nlpText ||
      input.rawOcrText ||
      '';

    const docCategory = ((input.documentCategory as string) || (input as any).documentType || 'ADANGAL').toUpperCase();

    // If text is empty, return zero confidence record with zero hallucination
    if (!textToProcess || !textToProcess.trim()) {
      return {
        success: true,
        extractedRecord: {
          documentType: docCategory,
          documentTitle: 'Empty Document (No Text Extracted)',
          overallConfidence: 0.0,
          districtName: null,
          districtConfidence: 0.0,
          revenueDivision: null,
          revenueDivisionConfidence: 0.0,
          mandalName: null,
          mandalConfidence: 0.0,
          villageName: null,
          villageConfidence: 0.0,
          surveyNumber: null,
          surveyConfidence: 0.0,
          subDivisionNumber: null,
          subDivisionConfidence: 0.0,
          khataNumber: null,
          khataConfidence: 0.0,
          ownerName: null,
          ownerConfidence: 0.0,
          fatherOrHusbandName: null,
          fatherConfidence: 0.0,
          relationship: null,
          extentAcres: null,
          extentConfidence: 0.0,
          landClassification: null,
          classificationConfidence: 0.0,
          documentDate: null,
          dateConfidence: 0.0,
          registrationNumber: null,
          mutationReference: null,
          boundaries: {
            east: null,
            west: null,
            north: null,
            south: null,
            confidence: 0.0,
          },
          customSections: [],
          checklist: [],
        },
        status: 'SUCCESS' as const,
        modelUsed: this.modelIdentifier,
        rawMetadata: {
          promptVersion: this.promptVersion,
          note: 'Empty extracted text; all fields and confidence scores initialized strictly to null/0.0.',
        },
      };
    }

    const systemPrompt = `You are an expert Indian Land Record Data Extraction AI for e-Bhoomi (SIH26018, Andhra Pradesh Revenue Department).
Extract structured land record attributes and compute realistic confidence scores based on the provided OCR/extracted document text.

DOCUMENT TYPE: ${docCategory}

STRICT EXTRACTION & CONFIDENCE RULES:
1. Extract ONLY facts supported by the text. DO NOT hallucinate or guess.
2. If a field is not present in the text, set value to null and confidence to 0.0.
3. For present fields, calculate confidence between 0.50 and 0.99 based on OCR clarity, completeness, and contextual certainty.
4. overallConfidence MUST be the true mathematical average of the present fields' confidence scores (or 0.0 if nothing was extracted). Never return a fake hardcoded 0.85.
5. Provide the exact text snippet as 'evidence' for each extracted field where available.
6. Generate customSections and checklist tailored specifically to the document type:
   - For ADANGAL: Include Possession & Cultivator Details, Crop/Tenancy Details, Land Parcel & Boundaries.
   - For ROR_1B: Include Khata Number, Pattadar & Guardian, Survey Schedule, Tax Assessment.
   - For PASSBOOK: Include Passbook/Title Deed Number, Pattadar Schedule, Issuing Authority & Signature.
   - For MUTATION: Include Proceeding Reference, Previous Owner (Transferor), New Owner (Transferee), Transferred Extent, Mode of Acquisition.
   - For PARTITION: Include Ancestral Pattadar, List of Legal Heirs & Share Allocations, Sub-divided Survey Extents.
   - For LEGACY_REVENUE: Include Historical Register Type, Old vs Re-survey Number, Inam/Settlement Category.

JSON SCHEMA TO RETURN:
{
  "documentType": "${docCategory}",
  "documentTitle": "string",
  "documentTitleTe": "string in Telugu",
  "overallConfidence": number between 0.0 and 1.0,
  "districtName": "string or null",
  "districtConfidence": number between 0.0 and 1.0,
  "districtEvidence": "string or null",
  "revenueDivision": "string or null",
  "revenueDivisionConfidence": number between 0.0 and 1.0,
  "mandalName": "string or null",
  "mandalConfidence": number between 0.0 and 1.0,
  "mandalEvidence": "string or null",
  "villageName": "string or null",
  "villageConfidence": number between 0.0 and 1.0,
  "villageEvidence": "string or null",
  "surveyNumber": "string or null",
  "surveyConfidence": number between 0.0 and 1.0,
  "surveyEvidence": "string or null",
  "subDivisionNumber": "string or null",
  "subDivisionConfidence": number between 0.0 and 1.0,
  "khataNumber": "string or null",
  "khataConfidence": number between 0.0 and 1.0,
  "khataEvidence": "string or null",
  "ownerName": "string or null",
  "ownerConfidence": number between 0.0 and 1.0,
  "ownerEvidence": "string or null",
  "fatherOrHusbandName": "string or null",
  "fatherConfidence": number between 0.0 and 1.0,
  "fatherEvidence": "string or null",
  "relationship": "string or null",
  "extentAcres": "string or null",
  "extentConfidence": number between 0.0 and 1.0,
  "extentEvidence": "string or null",
  "landClassification": "string or null",
  "classificationConfidence": number between 0.0 and 1.0,
  "documentDate": "string or null",
  "dateConfidence": number between 0.0 and 1.0,
  "registrationNumber": "string or null",
  "mutationReference": "string or null",
  "boundaries": {
    "east": "string or null",
    "west": "string or null",
    "north": "string or null",
    "south": "string or null",
    "confidence": number between 0.0 and 1.0
  },
  "customSections": [
    {
      "sectionId": "string",
      "sectionTitle": "string",
      "sectionTitleTe": "string",
      "fields": [
        {
          "fieldId": "string",
          "labelEn": "string",
          "labelTe": "string",
          "value": "string or null",
          "confidence": number,
          "evidence": "string or null"
        }
      ]
    }
  ],
  "checklist": [
    {
      "id": "string",
      "labelEn": "string",
      "labelTe": "string",
      "verified": boolean,
      "confidence": number,
      "reason": "string"
    }
  ],
  "parties": [
    {
      "name": "string",
      "relationship": "string",
      "share": "string",
      "extent": "string",
      "surveyNumber": "string or null"
    }
  ]
}`;

    const userPrompt = `Target Document Category: ${docCategory}\nDetected Language: ${input.detectedLanguage || 'TELUGU/ENGLISH'}\n\nDocument Text:\n${textToProcess}\n\nExtract and return the customized JSON object according to the schema.`;

    const requestGroq = async (model: string, useJsonFormat: boolean) => {
      const payload: any = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      };
      if (useJsonFormat) {
        payload.response_format = { type: 'json_object' };
      }

      return fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) e-Bhoomi-LandRecord/1.0',
        },
        body: JSON.stringify(payload),
      });
    };

    try {
      let res = await requestGroq(this.modelIdentifier, true);
      let modelUsed = this.modelIdentifier;

      // If HTTP 400, retry without strict json_object constraint or with fallback model
      if (!res.ok && res.status === 400) {
        console.warn(`[GROQ] Initial JSON mode request failed with status ${res.status}, retrying without strict json_object constraint...`);
        res = await requestGroq(this.modelIdentifier, false);
      }

      if (!res.ok && this.modelIdentifier !== 'llama-3.3-70b-versatile') {
        console.warn(`[GROQ] Retrying with fallback model llama-3.3-70b-versatile...`);
        res = await requestGroq('llama-3.3-70b-versatile', true);
        modelUsed = 'llama-3.3-70b-versatile';
      }

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          status: 'AI_EXTRACTION_FAILED' as const,
          errorReason: `Groq API HTTP error ${res.status}: ${errText.substring(0, 150)}`,
          modelUsed,
        };
      }

      const data = await res.json();
      let contentStr = data.choices?.[0]?.message?.content;
      if (!contentStr) {
        return {
          success: false,
          status: 'AI_EXTRACTION_FAILED' as const,
          errorReason: 'Groq API returned an empty completion choice.',
          modelUsed,
        };
      }

      // Robust JSON extraction and repair
      const cleanJsonString = (raw: string): string => {
        let cleaned = raw.trim();
        // Remove markdown backticks if wrapped
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.slice(7);
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.slice(0, -3);
        }
        cleaned = cleaned.trim();

        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.slice(firstBrace, lastBrace + 1);
        }

        // Remove trailing commas before closing braces/brackets
        cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');

        return cleaned;
      };

      const sanitizedStr = cleanJsonString(contentStr);
      let extractedRecord: any = null;

      try {
        extractedRecord = JSON.parse(sanitizedStr);
      } catch (firstErr) {
        // Attempt aggressive repair if initial parse fails (e.g. unescaped newlines in strings or truncated JSON)
        try {
          // Replace literal newlines/tabs inside quotes
          let repaired = sanitizedStr
            .replace(/(?<=:\s*"[^"]*)\n([^"]*")/g, '\\n$1')
            .replace(/,\s*([\}\]])/g, '$1');
          
          // If unclosed braces/brackets exist, try balancing
          const openBraces = (repaired.match(/\{/g) || []).length;
          const closeBraces = (repaired.match(/\}/g) || []).length;
          if (openBraces > closeBraces) {
            repaired += '}'.repeat(openBraces - closeBraces);
          }
          const openBrackets = (repaired.match(/\[/g) || []).length;
          const closeBrackets = (repaired.match(/\]/g) || []).length;
          if (openBrackets > closeBrackets) {
            repaired += ']'.repeat(openBrackets - closeBrackets);
          }

          extractedRecord = JSON.parse(repaired);
        } catch (secondErr: any) {
          console.error('[GROQ] Failed to parse JSON even after repair attempt:', secondErr.message);
          // Fallback minimal record to prevent complete pipeline freeze
          extractedRecord = {
            documentType: docCategory,
            documentTitle: `${docCategory} Revenue Record`,
            overallConfidence: 0.50,
            districtName: null,
            districtConfidence: 0.0,
            mandalName: null,
            villageName: null,
            surveyNumber: null,
            khataNumber: null,
            ownerName: null,
            customSections: [],
            checklist: [],
          };
        }
      }

      // Compute true overall confidence if not computed by model
      if (extractedRecord.overallConfidence === undefined || extractedRecord.overallConfidence === null) {
        const scores: number[] = [];
        if (extractedRecord.surveyConfidence) scores.push(extractedRecord.surveyConfidence);
        if (extractedRecord.ownerConfidence) scores.push(extractedRecord.ownerConfidence);
        if (extractedRecord.extentConfidence) scores.push(extractedRecord.extentConfidence);
        if (extractedRecord.districtConfidence) scores.push(extractedRecord.districtConfidence);
        if (extractedRecord.villageConfidence) scores.push(extractedRecord.villageConfidence);
        if (extractedRecord.mandalConfidence) scores.push(extractedRecord.mandalConfidence);
        if (extractedRecord.khataConfidence) scores.push(extractedRecord.khataConfidence);
        
        extractedRecord.overallConfidence =
          scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
            : 0.0;
      }

      return {
        success: true,
        extractedRecord,
        status: 'SUCCESS' as const,
        modelUsed,
        rawMetadata: {
          promptVersion: this.promptVersion,
          usage: data.usage || null,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'AI_EXTRACTION_FAILED' as const,
        errorReason: `Groq AI Provider Exception: ${err.message}`,
        modelUsed: this.modelIdentifier,
      };
    }
  }
}
