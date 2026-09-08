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

    if (!textToProcess || !textToProcess.trim()) {
      return {
        success: true,
        extractedRecord: {
          districtName: null,
          revenueDivision: null,
          mandalName: null,
          villageName: null,
          surveyNumber: null,
          subDivisionNumber: null,
          khataNumber: null,
          ownerName: null,
          fatherOrHusbandName: null,
          relationship: null,
          extentAcres: null,
          landClassification: null,
          documentDate: null,
          registrationNumber: null,
          mutationReference: null,
          boundaries: {
            east: null,
            west: null,
            north: null,
            south: null,
          },
        },
        status: 'SUCCESS' as const,
        modelUsed: this.modelIdentifier,
        rawMetadata: {
          promptVersion: this.promptVersion,
          note: 'Empty extracted text provided; structured record initialized with all null fields without hallucination.',
        },
      };
    }

    const systemPrompt = `You are an expert Indian Land Record Data Extraction AI for e-Bhoomi (SIH26018).
Extract land record attributes from the provided Llama-extracted document text.
STRICT RULES:
1. Extract ONLY facts supported by the provided text.
2. DO NOT invent missing names, survey numbers, khata numbers, boundaries, or extent values.
3. If a field is not mentioned or missing, return null.
4. Output MUST be valid JSON conforming strictly to the requested schema.

JSON SCHEMA:
{
  "districtName": "string or null",
  "revenueDivision": "string or null",
  "mandalName": "string or null",
  "villageName": "string or null",
  "surveyNumber": "string or null",
  "subDivisionNumber": "string or null",
  "khataNumber": "string or null",
  "ownerName": "string or null",
  "fatherOrHusbandName": "string or null",
  "relationship": "string or null",
  "extentAcres": "string or null",
  "landClassification": "string or null",
  "documentDate": "string or null",
  "registrationNumber": "string or null",
  "mutationReference": "string or null",
  "boundaries": {
    "east": "string or null",
    "west": "string or null",
    "north": "string or null",
    "south": "string or null"
  }
}`;

    const userPrompt = `Document Category: ${input.documentCategory || 'LAND_RECORD'}\nDetected Language: ${input.detectedLanguage || 'TELUGU/ENGLISH'}\n\nDocument Text:\n${textToProcess}\n\nRespond with a valid JSON object only.`;

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

      // If HTTP 400 (e.g., JSON schema validation error on Groq), retry without strict response_format or with fallback model
      if (!res.ok && res.status === 400) {
        console.warn(`[GROQ] Initial JSON mode request failed with status ${res.status}, retrying without strict json_object constraint...`);
        res = await requestGroq(this.modelIdentifier, false);
      }

      // If still failing, retry with llama-3.3-70b-versatile if different
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

      // Extract pure JSON object from potential markdown wrapping
      contentStr = contentStr.trim();
      const firstBrace = contentStr.indexOf('{');
      const lastBrace = contentStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        contentStr = contentStr.slice(firstBrace, lastBrace + 1);
      }

      const extractedRecord = JSON.parse(contentStr);
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
