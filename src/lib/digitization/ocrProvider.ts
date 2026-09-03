import { NormalizedOCRResult, NormalizedOCRPage, OCRBlock, OCRLine, OCRWord } from '@/types/documentProcessingJob';

export interface OCRPageResult {
  pageNumber: number;
  text: string;
  confidence: number; // 0.0 - 1.0
  wordCount: number;
}

export interface OCRResult extends NormalizedOCRResult {
  extractedText: string; // Backward compatibility
  processingTimeMs?: number;
}

export interface OCRProvider {
  processDocument(fileBuffer: ArrayBuffer, mimeType: string, fileName?: string): Promise<OCRResult>;
}

export class DefaultOCRProvider implements OCRProvider {
  async processDocument(fileBuffer: ArrayBuffer, mimeType: string, fileName?: string): Promise<OCRResult> {
    const startTime = Date.now();
    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const isPdf = mimeType.includes('pdf');
    const docName = fileName || (isPdf ? 'document.pdf' : 'document.jpg');

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return {
        extractedText: '',
        overallConfidence: 0,
        pageCount: 1,
        detectedLanguage: 'te',
        pages: [],
        processedAt: new Date().toISOString(),
        ocrEngine: 'eBhoomi Telugu OCR Engine',
        processingTimeMs: 0,
      };
    }

    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, docName);

      const response = await fetch(`${pythonServiceUrl}/document-processing/ocr`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          extractedText: data.rawOCRText || data.normalizedOCRText || '',
          overallConfidence: data.handwritingDetected ? 0.85 : 0.92,
          pageCount: data.pageCount || (isPdf ? 1 : 1),
          detectedLanguage: data.language || 'te',
          pages: (data.pages || []).map((p: any) => ({
            pageNumber: p.pageNumber,
            fullPageText: p.normalizedText || p.rawText || '',
            confidence: 0.90,
            detectedLanguage: 'te',
            blocks: [],
            hasHandwritingDetected: p.handwritingDetected || false,
          })),
          processedAt: data.processedAt || new Date().toISOString(),
          ocrEngine: data.provider || 'TeluguOCR + TeluguHandwrittenOCR',
          processingTimeMs: data.processingTimeMs || (Date.now() - startTime),
        };
      }
    } catch (err) {
      console.warn('Python OCR Service offline or un-initialized:', err);
    }

    const normalizedPages: NormalizedOCRPage[] = [{
      pageNumber: 1,
      fullPageText: '',
      confidence: 0,
      detectedLanguage: 'te',
      blocks: [],
      hasHandwritingDetected: false,
    }];

    return {
      extractedText: '',
      overallConfidence: 0,
      pageCount: 1,
      detectedLanguage: 'te',
      pages: normalizedPages,
      processedAt: new Date().toISOString(),
      ocrEngine: 'eBhoomi Telugu OCR Engine',
      processingTimeMs: Date.now() - startTime,
    };
  }
}
