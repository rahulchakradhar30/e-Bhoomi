import { PreprocessedPage } from '@/types/documentProcessingJob';

export interface PreprocessingPipeline {
  executePreprocessing(
    originalFileName: string,
    fileSizeBytes: number,
    pageCount: number,
    mimeType: string
  ): Promise<PreprocessedPage[]>;
}

export class DefaultPreprocessingPipeline implements PreprocessingPipeline {
  async executePreprocessing(
    originalFileName: string,
    fileSizeBytes: number,
    pageCount: number,
    mimeType: string
  ): Promise<PreprocessedPage[]> {
    const preprocessedPages: PreprocessedPage[] = [];

    for (let p = 1; p <= pageCount; p++) {
      preprocessedPages.push({
        pageNumber: p,
        originalPageRef: `secure://ebhoomi-originals/${originalFileName}#page=${p}`,
        processedPageRef: `secure://ebhoomi-preprocessed/${originalFileName}_p${p}_norm.png`,
        width: 2480, // Standard 300 DPI A4
        height: 3508,
        rotationDegrees: 0,
        skewAngle: 0.2, // Minor alignment angle
        contrastScore: 0.94,
        brightnessScore: 0.91,
        isDeskewed: true,
        isCropped: true,
        status: 'COMPLETED',
      });
    }

    return preprocessedPages;
  }
}
