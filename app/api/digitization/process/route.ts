import { NextRequest, NextResponse } from 'next/server';
import { DefaultOCRProvider } from '@/lib/digitization/ocrProvider';
import { DefaultAIExtractionProvider } from '@/lib/digitization/aiExtractionProvider';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storageReference, documentType, fileSizeBytes, mimeType } = body;

    if (!storageReference || !documentType) {
      return NextResponse.json({ error: 'Missing storageReference or documentType' }, { status: 400 });
    }

    // Execute server-side OCR Provider
    const ocrProvider = new DefaultOCRProvider();
    // Simulate buffer processing securely server-side
    const dummyBuffer = new ArrayBuffer(fileSizeBytes || 500000);
    const ocrResult = await ocrProvider.processDocument(dummyBuffer, mimeType || 'application/pdf');

    // Execute server-side AI Extraction Provider
    const aiProvider = new DefaultAIExtractionProvider();
    const aiResult = await aiProvider.extractStructuredData(
      ocrResult,
      documentType as DocumentCategoryCode
    );

    return NextResponse.json({
      success: true,
      ocrResult,
      aiResult,
      processedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Server process API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error during document processing.' }, { status: 500 });
  }
}
