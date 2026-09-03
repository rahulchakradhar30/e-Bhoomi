import { DefaultOCRProvider, OCRResult } from '../ocrProvider';
import { EnglishOCRProvider } from './englishOcrProvider';
import { LanguageDetector, DocumentLanguage } from '../language/languageDetector';

export class UnifiedOCRRouter {
  public static ROUTER_VERSION = 'v7.0-UnifiedOCRRouter';

  private defaultOcr = new DefaultOCRProvider();
  private englishOcr = new EnglishOCRProvider();

  public async processDocument(
    fileBuffer: ArrayBuffer,
    mimeType: string,
    options: {
      languageHint?: DocumentLanguage;
      sampleText?: string;
    } = {}
  ): Promise<OCRResult> {
    const textToAnalyze = options.sampleText || '';
    const langRes = LanguageDetector.detectLanguage(textToAnalyze);
    const effectiveLang = options.languageHint || langRes.detectedLanguage;

    if (effectiveLang === 'ENGLISH') {
      return this.englishOcr.processEnglishDocument(options.sampleText);
    }

    return this.defaultOcr.processDocument(fileBuffer, mimeType);
  }
}
