import { NextRequest, NextResponse } from 'next/server';
import { DefaultOCRProvider } from '@/lib/digitization/ocrProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceFile, fileBase64 } = body;

    const ocrProvider = new DefaultOCRProvider();
    let fileBuffer: ArrayBuffer;

    if (fileBase64 && typeof fileBase64 === 'string') {
      const binaryString = atob(fileBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileBuffer = bytes.buffer;
    } else {
      fileBuffer = new ArrayBuffer(0);
    }

    const ocrResult = await ocrProvider.processDocument(
      fileBuffer,
      sourceFile?.fileType || 'application/pdf',
      sourceFile?.originalFileName
    );

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
