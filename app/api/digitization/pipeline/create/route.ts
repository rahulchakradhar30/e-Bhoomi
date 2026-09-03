import { NextRequest, NextResponse } from 'next/server';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { DocumentProcessingJob } from '@/types/documentProcessingJob';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uploadRecord, vroSelectedDocumentType } = body;

    if (!uploadRecord || !vroSelectedDocumentType) {
      return NextResponse.json({ error: 'Missing uploadRecord or vroSelectedDocumentType' }, { status: 400 });
    }

    const processingId = `JOB-PROC-${Date.now()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

    const job: DocumentProcessingJob = {
      processingId,
      digitizationId: `DIG-${Date.now()}`,
      vroSelectedDocumentType: vroSelectedDocumentType as DocumentCategoryCode,
      detectedDocumentType: 'UNKNOWN_OTHER',
      classificationMismatch: false,
      sourceFile: uploadRecord,
      preprocessedPages: [],
      preprocessingStatus: 'PENDING',
      classificationStatus: 'PENDING',
      ocrStatus: 'PENDING',
      visionStatus: 'PENDING',
      overallStatus: 'UPLOADED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (err: any) {
    console.error('Job creation error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
