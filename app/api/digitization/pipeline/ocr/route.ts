import { NextRequest, NextResponse } from 'next/server';
import { DefaultOCRProvider } from '@/lib/digitization/ocrProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceFile } = body;

    const ocrProvider = new DefaultOCRProvider();
    const dummyBuffer = new ArrayBuffer(sourceFile?.fileSizeBytes || 500000);
    const ocrResult = await ocrProvider.processDocument(dummyBuffer, sourceFile?.fileType || 'application/pdf');

    return NextResponse.json({
      success: true,
      ocrResult,
      ocrStatus: ocrResult.overallConfidence === 0 && !ocrResult.extractedText ? 'OCR_MODEL_NOT_AVAILABLE' : 'COMPLETED',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('OCR API error:', err);
    return NextResponse.json({ error: err.message || 'OCR processing error' }, { status: 500 });
  }
}
