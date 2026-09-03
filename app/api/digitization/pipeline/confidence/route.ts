import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { extractionResult } = body;

    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

    // Call Python FastAPI service for Field-Level Confidence & Source Evidence Scoring
    const confRes = await fetch(`${pythonServiceUrl}/document-processing/confidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extractionResult: extractionResult || {},
      }),
    });

    if (confRes.ok) {
      const confData = await confRes.json();
      return NextResponse.json({
        success: true,
        confidenceResult: confData,
        confidenceStatus: confData.status || 'CONFIDENCE_COMPLETED',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: false,
      confidenceStatus: 'CONFIDENCE_FAILED',
      errorMessage: 'Python AI Service confidence scoring request failed.',
    }, { status: 500 });
  } catch (err: any) {
    console.error('Confidence API error:', err);
    return NextResponse.json({ error: err.message || 'Confidence processing error' }, { status: 500 });
  }
}
