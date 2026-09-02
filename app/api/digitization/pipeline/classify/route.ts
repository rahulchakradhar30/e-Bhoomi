import { NextRequest, NextResponse } from 'next/server';
import { DefaultClassificationProvider } from '@/lib/digitization/classificationProvider';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullText, vroSelectedDocumentType, pageCount } = body;

    const classifier = new DefaultClassificationProvider();
    const result = await classifier.classifyDocument(
      fullText || '',
      vroSelectedDocumentType as DocumentCategoryCode,
      pageCount || 1
    );

    const isMismatch =
      result.predictedType !== 'UNKNOWN_OTHER' &&
      result.predictedType !== vroSelectedDocumentType;

    return NextResponse.json({
      success: true,
      classificationResult: result,
      detectedDocumentType: result.predictedType,
      classificationMismatch: isMismatch,
      classificationStatus: 'COMPLETED',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Classification API error:', err);
    return NextResponse.json({ error: err.message || 'Classification error' }, { status: 500 });
  }
}
