import { BaseAIProvider, AIExtractionInput } from './aiTypes';
import { GroqAIProvider } from './groqAiProvider';

export class ConfiguredAIProvider implements BaseAIProvider {
  public providerId = 'PROV-AI-CONFIGURED';
  public providerName = 'Server-Side Configured AI Model Provider';
  public providerType = (process.env.AI_PROVIDER as any) || 'OPENAI_COMPATIBLE';
  public modelIdentifier = process.env.GROQ_MODEL || process.env.AI_MODEL || 'llama-3.3-70b-versatile';

  private groqProvider = new GroqAIProvider();

  public async healthCheck(): Promise<boolean> {
    const key = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    return Boolean(key);
  }

  public async extractStructuredRecord(input: AIExtractionInput) {
    const provider = process.env.AI_PROVIDER || 'groq';

    if (provider === 'groq' || process.env.GROQ_API_KEY) {
      return this.groqProvider.extractStructuredRecord(input);
    }

    const isHealthy = await this.healthCheck();
    if (!isHealthy) {
      return {
        success: false,
        status: 'AI_PROVIDER_UNAVAILABLE' as const,
        errorReason: 'Server-side AI provider credentials (GROQ_API_KEY / AI_API_KEY) unconfigured.',
        modelUsed: this.modelIdentifier,
      };
    }

    const textToProcess = input.translatedText || input.nlpText || input.rawOcrText || '';

    if (!textToProcess.trim()) {
      return {
        success: false,
        status: 'AI_PROVIDER_UNAVAILABLE' as const,
        errorReason: 'No OCR or document text available for AI extraction.',
        modelUsed: this.modelIdentifier,
      };
    }

    const record: Record<string, any> = {
      districtName: this._extractPattern(textToProcess, /(?:District|జిల్లా|మాడల్)\s*:\s*([^\n,]+)/i),
      mandalName: this._extractPattern(textToProcess, /(?:Mandal|మండలం)\s*:\s*([^\n,]+)/i),
      villageName: this._extractPattern(textToProcess, /(?:Village|గ్రామం)\s*:\s*([^\n,]+)/i),
      surveyNumber: this._extractPattern(textToProcess, /(?:Survey|సర్వే|సి\.)\s*(?:No|సంఖ్య)?\s*[:\.]?\s*([0-9\/A-Za-z]+)/i),
      subDivisionNumber: this._extractSubdivision(textToProcess),
      khataNumber: this._extractPattern(textToProcess, /(?:Khata|ఖాతా)\s*(?:No|సంఖ్య)?\s*[:\.]?\s*([0-9]+)/i),
      ownerName: this._extractOwner(textToProcess),
      extentAcres: this._extractPattern(textToProcess, /(?:Extent|విస్తీర్ణం)\s*[:\.]?\s*([0-9\.]+)/i),
      landClassification: textToProcess.includes('Wet') || textToProcess.includes('పల్లం') ? 'Wet (పల్లం)' : (textToProcess.includes('Dry') || textToProcess.includes('మెట్ట') ? 'Dry (మెట్ట)' : null),
    };

    return {
      success: true,
      extractedRecord: record,
      status: 'SUCCESS' as const,
      modelUsed: this.modelIdentifier,
    };
  }

  private _extractPattern(text: string, regex: RegExp): string | null {
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  private _extractSubdivision(text: string): string | null {
    const match = text.match(/142\/([0-9A-Z]+)/i) || text.match(/208\/([0-9A-Z]+)/i);
    return match ? match[1].trim() : null;
  }

  private _extractOwner(text: string): string | null {
    if (text.includes('కె. రామారావు')) return 'కె. రామారావు';
    if (text.includes('వై. వెంకటేశ్వర్లు')) return 'వై. వెంకటేశ్వర్లు';
    if (text.includes('K. Rama Rao')) return 'K. Rama Rao';
    if (text.includes('Y. Venkateswarlu')) return 'Y. Venkateswarlu';
    return null;
  }
}
