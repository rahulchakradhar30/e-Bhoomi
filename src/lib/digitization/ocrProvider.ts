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
  processDocument(fileBuffer: ArrayBuffer, mimeType: string): Promise<OCRResult>;
}

export class DefaultOCRProvider implements OCRProvider {
  async processDocument(fileBuffer: ArrayBuffer, mimeType: string): Promise<OCRResult> {
    const startTime = Date.now();
    const isPdf = mimeType.includes('pdf');
    const estimatedPages = isPdf ? Math.max(1, Math.ceil((fileBuffer.byteLength || 1000) / 150000)) : 1;

    const normalizedPages: NormalizedOCRPage[] = [];

    for (let p = 1; p <= estimatedPages; p++) {
      normalizedPages.push({
        pageNumber: p,
        fullPageText: '',
        confidence: 0,
        detectedLanguage: 'multilingual',
        blocks: [],
        hasHandwritingDetected: false,
      });
    }

    return {
      extractedText: '',
      overallConfidence: 0,
      pageCount: estimatedPages,
      detectedLanguage: 'multilingual',
      pages: normalizedPages,
      processedAt: new Date().toISOString(),
      ocrEngine: 'eBhoomi Document Intelligence Engine (OCR Pending Phase 1B)',
      processingTimeMs: Date.now() - startTime,
    };
  }
}
