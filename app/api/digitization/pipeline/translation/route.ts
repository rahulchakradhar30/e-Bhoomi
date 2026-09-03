import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nlpResult } = body;

    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

    // Call Python FastAPI service for IndicTrans2 Telugu -> English translation
    const transRes = await fetch(`${pythonServiceUrl}/document-processing/translation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nlpResult || {}),
    });

    if (transRes.ok) {
      const transData = await transRes.json();
      return NextResponse.json({
        success: true,
        translationResult: transData,
        translationStatus: transData.status || 'COMPLETED',
        updatedAt: new Date().toISOString(),
      });
    }

    // Fallback if model weights pending initialization
    return NextResponse.json({
      success: true,
      translationResult: {
        status: 'TRANSLATION_MODEL_UNAVAILABLE',
        provider: 'IndicTrans2Provider (Offline / Pending Setup)',
        sourceLanguage: 'te',
        targetLanguage: 'en',
        rawOCRText: nlpResult?.rawOCRText || '',
        normalizedOCRText: nlpResult?.normalizedOCRText || '',
        nlpProcessedText: nlpResult?.nlpProcessedText || '',
        translatedText: nlpResult?.nlpProcessedText || nlpResult?.normalizedOCRText || '',
        overallStatus: 'READY_FOR_AI_EXTRACTION',
        pages: nlpResult?.pages || [],
      },
      translationStatus: 'TRANSLATION_MODEL_UNAVAILABLE',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Translation API error:', err);
    return NextResponse.json({ error: err.message || 'Translation processing error' }, { status: 500 });
  }
}
