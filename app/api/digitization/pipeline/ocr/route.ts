import { NextRequest, NextResponse } from 'next/server';
import { DefaultOCRProvider } from '@/lib/digitization/ocrProvider';
import { cloudinaryStorage } from '@/lib/storage/cloudinaryService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceFile, fileBase64 } = body;

    const ocrProvider = new DefaultOCRProvider();
    let fileBuffer: ArrayBuffer | null = null;
    let mimeType = sourceFile?.fileType || 'application/pdf';
    let fileName = sourceFile?.originalFileName || 'document.pdf';

    // 1. Primary: Retrieve actual document from server-side storage reference
    if (sourceFile?.storageReference) {
      const storedDoc = await cloudinaryStorage.retrieveDocument(sourceFile.storageReference);
      if (storedDoc) {
        fileBuffer = storedDoc.buffer;
        mimeType = storedDoc.mimeType || mimeType;
        fileName = storedDoc.fileName || fileName;
      }
    }

    // 2. Secondary: Direct Base64 payload if passed
    if (!fileBuffer && fileBase64 && typeof fileBase64 === 'string') {
      const binaryString = atob(fileBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileBuffer = bytes.buffer;
    }

    // 3. Strict failure if no actual document bytes could be retrieved
    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          error: 'DOCUMENT_RETRIEVAL_FAILED',
          details: `Unable to retrieve document bytes for storage reference: ${sourceFile?.storageReference || 'NONE'}`,
        },
        { status: 404 }
      );
    }

    const ocrResult = await ocrProvider.processDocument(fileBuffer, mimeType, fileName);

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
