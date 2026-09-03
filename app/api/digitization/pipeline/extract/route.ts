import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { translationResult, nlpResult, ocrResult, documentType } = body;

    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

    // Call Python FastAPI service for AI/NLP Structured Extraction
    const extractRes = await fetch(`${pythonServiceUrl}/document-processing/extraction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        translationResult,
        nlpResult,
        ocrResult,
        documentType: documentType || 'UNKNOWN_OTHER',
      }),
    });

    if (extractRes.ok) {
      const extractData = await extractRes.json();
      return NextResponse.json({
        success: true,
        extractionResult: extractData,
        extractionStatus: extractData.status || 'AI_EXTRACTION_COMPLETED',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: false,
      extractionStatus: 'AI_EXTRACTION_FAILED',
      errorMessage: 'Python AI Service extraction request failed.',
    }, { status: 500 });
  } catch (err: any) {
    console.error('Extraction API error:', err);
    return NextResponse.json({ error: err.message || 'AI extraction processing error' }, { status: 500 });
  }
}
