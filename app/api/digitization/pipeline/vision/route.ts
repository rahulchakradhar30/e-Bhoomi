import { NextRequest, NextResponse } from 'next/server';
import { DefaultVisionProvider } from '@/lib/digitization/visionProvider';
import { DocumentSchemaRegistry } from '@/config/documentSchemaRegistry';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { NormalizedDocumentRepresentation } from '@/types/documentProcessingJob';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, vroSelectedDocumentType, detectedDocumentType, isMismatch, sourceFile, preprocessedPages, classificationResult, ocrResult } = body;

    const visionProvider = new DefaultVisionProvider();
    const visionResult = await visionProvider.analyzeDocumentVision(
      sourceFile?.pageCount || 1,
      sourceFile?.fileType || 'application/pdf'
    );

    const finalType = detectedDocumentType !== 'UNKNOWN_OTHER' ? detectedDocumentType : vroSelectedDocumentType;
    const targetSchema = DocumentSchemaRegistry.getSchema(finalType as DocumentCategoryCode);

    const normalizedRepresentation: NormalizedDocumentRepresentation = {
      jobId: jobId || `JOB-${Date.now()}`,
      digitizationId: `DIG-${Date.now()}`,
      vroSelectedType: vroSelectedDocumentType as DocumentCategoryCode,
      finalDocumentType: finalType as DocumentCategoryCode,
      isTypeMismatched: !!isMismatch,
      originalDocumentRef: sourceFile?.storageReference || '',
      originalFileName: sourceFile?.originalFileName || '',
      pageCount: sourceFile?.pageCount || 1,
      preprocessedPages: preprocessedPages || [],
      classification: classificationResult,
      ocr: ocrResult,
      vision: visionResult,
      selectedSchemaVersion: targetSchema.version,
      readyForExtraction: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      visionResult,
      documentQuality: visionResult.documentQuality,
      normalizedRepresentation,
      visionStatus: 'COMPLETED',
      overallStatus: 'READY_FOR_AI_EXTRACTION',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Vision API error:', err);
    return NextResponse.json({ error: err.message || 'Vision processing error' }, { status: 500 });
  }
}
