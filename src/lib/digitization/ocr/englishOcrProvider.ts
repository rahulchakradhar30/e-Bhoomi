import { DefaultOCRProvider, OCRResult } from '../ocrProvider';

export class EnglishOCRProvider extends DefaultOCRProvider {
  public providerId = 'PROV-OCR-ENG-01';
  public providerName = 'Tesseract / EasyOCR English Production Engine';
  public version = 'v3.2.0-English';

  public async processEnglishDocument(sampleText?: string): Promise<OCRResult> {
    const startTime = Date.now();
    const mockText = sampleText || 'GOVERNMENT OF ANDHRA PRADESH - REVENUE DEPARTMENT\nRECORD OF RIGHTS - ROR 1B\nDistrict: Kurnool, Mandal: Adoni, Village: Arjanapalle\nSurvey No: 142/3A, Khata No: 482, Extent: 2.45 Acres\nPattadar Name: K. Rama Rao';

    return {
      extractedText: mockText,
      overallConfidence: 0.95,
      pageCount: 1,
      detectedLanguage: 'en',
      pages: [
        {
          pageNumber: 1,
          fullPageText: mockText,
          confidence: 0.95,
          detectedLanguage: 'en',
          blocks: [],
          hasHandwritingDetected: false,
        },
      ],
      processedAt: new Date().toISOString(),
      ocrEngine: this.providerName,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
