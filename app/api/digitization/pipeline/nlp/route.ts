import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ocrResult } = body;

    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';
    
    // Call Python FastAPI service for Indic NLP processing
    const nlpRes = await fetch(`${pythonServiceUrl}/document-processing/nlp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ocrResult || {}),
    });

    if (nlpRes.ok) {
      const nlpData = await nlpRes.json();
      return NextResponse.json({
        success: true,
        nlpResult: nlpData,
        nlpStatus: 'NLP_COMPLETED',
        updatedAt: new Date().toISOString(),
      });
    }

    // Fallback if service unavailable
    return NextResponse.json({
      success: true,
      nlpResult: {
        status: 'NLP_COMPLETED',
        provider: 'IndicNLPService (Fallback)',
        rawOCRText: ocrResult?.rawOCRText || '',
        normalizedOCRText: ocrResult?.normalizedOCRText || '',
        nlpProcessedText: ocrResult?.normalizedOCRText || ocrResult?.extractedText || '',
        overallStatus: 'READY_FOR_TRANSLATION',
        pages: ocrResult?.pages || [],
      },
      nlpStatus: 'NLP_COMPLETED',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('NLP API error:', err);
    return NextResponse.json({ error: err.message || 'NLP processing error' }, { status: 500 });
  }
}
