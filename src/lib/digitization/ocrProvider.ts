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
    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const isPdf = mimeType.includes('pdf');
    const estimatedPages = isPdf ? Math.max(1, Math.ceil((fileBuffer.byteLength || 1000) / 150000)) : 1;

    try {
      const response = await fetch(`${pythonServiceUrl}/document-processing/ocr/metadata`, { method: 'GET' });
      if (response.ok) {
        const metadata = await response.json();
        if (metadata.isModelLoaded) {
          console.log('Connected to Python Telugu OCR Engine:', metadata.modelIdentifier);
        }
      }
    } catch (err) {
      console.warn('Python OCR Service offline or model weights un-initialized; returning unextracted state');
    }

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
      ocrEngine: 'eBhoomi Telugu OCR Engine (harsha-desaraju/telugu-ocr-model)',
      processingTimeMs: Date.now() - startTime,
    };
  }
}
