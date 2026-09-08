import { NextRequest, NextResponse } from 'next/server';
import { GroqAIProvider } from '@/lib/digitization/ai/groqAiProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      llamaExtractedText,
      extractedText,
      rawOcrText,
      normalizedText,
      nlpText,
      translatedText,
      detectedLanguage,
      documentCategory,
      documentType,
    } = body;

    const groqProvider = new GroqAIProvider();
    const isConfigured = await groqProvider.healthCheck();

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        status: 'AI_PROVIDER_NOT_CONFIGURED',
        errorReason: 'GROQ_API_KEY environment variable missing or empty on server.',
        modelUsed: groqProvider.modelIdentifier,
      }, { status: 400 });
    }

    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

    try {
      const pyRes = await fetch(`${pythonServiceUrl}/document-processing/extract-groq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json(pyData);
      }
    } catch (err) {
      console.warn('Python Groq Extraction Service offline, executing TypeScript GroqAIProvider fallback:', err);
    }

    console.log(`[GROQ] request started (model: ${groqProvider.modelIdentifier})`);

    // TypeScript GroqAIProvider Fallback
    const result = await groqProvider.extractStructuredRecord({
      llamaExtractedText: llamaExtractedText || extractedText || rawOcrText || '',
      extractedText: extractedText || llamaExtractedText || rawOcrText || '',
      rawOcrText: rawOcrText || llamaExtractedText || '',
      normalizedText,
      nlpText,
      translatedText,
      detectedLanguage,
      documentCategory: documentCategory || documentType,
    });

    console.log(`[GROQ] structured extraction completed (status: ${result.status})`);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Extraction API error:', err);
    return NextResponse.json({ error: err.message || 'Groq AI extraction error' }, { status: 500 });
  }
}
