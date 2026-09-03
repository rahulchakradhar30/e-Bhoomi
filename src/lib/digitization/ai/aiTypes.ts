export type AIProviderType = 'OPENAI_COMPATIBLE' | 'GEMINI' | 'GROQ' | 'LOCAL_MODEL' | 'UNAVAILABLE';

export interface AIProviderConfig {
  providerType: AIProviderType;
  modelIdentifier: string;
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface AIExtractionInput {
  rawOcrText: string;
  normalizedText?: string;
  nlpText?: string;
  translatedText?: string;
  detectedLanguage?: string;
  documentCategory?: string;
  evidenceReferences?: Record<string, any>;
}

export interface BaseAIProvider {
  providerId: string;
  providerName: string;
  providerType: AIProviderType;
  healthCheck(): Promise<boolean>;
  extractStructuredRecord(input: AIExtractionInput): Promise<{
    success: boolean;
    extractedRecord?: Record<string, any>;
    status: 'SUCCESS' | 'AI_PROVIDER_UNAVAILABLE' | 'AI_EXTRACTION_FAILED';
    errorReason?: string;
    modelUsed: string;
  }>;
}
