import { NextRequest, NextResponse } from 'next/server';
import { LanguageDetector } from '@/lib/digitization/language/languageDetector';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sampleText, documentCategoryHint } = body;

    const langResult = LanguageDetector.detectLanguage(sampleText || '');

    let category = documentCategoryHint || 'UNKNOWN_OTHER';
    const text = sampleText || '';

    if (text.includes('ROR') || text.includes('1B') || text.includes('1-B') || text.includes('హక్కుల పత్రం')) {
      category = 'ROR_1B';
    } else if (text.includes('ADANGAL') || text.includes('అడంగల్') || text.includes('పహాణీ')) {
      category = 'ADANGAL';
    } else if (text.includes('MUTATION') || text.includes('మ్యూటేషన్')) {
      category = 'MUTATION';
    } else if (text.includes('PARTITION') || text.includes('భాగ పరిష్కారం')) {
      category = 'PARTITION_SUCCESSION';
    }

    return NextResponse.json({
      success: true,
      classificationResult: {
        documentCategory: category,
        language: langResult.detectedLanguage,
        languageConfidence: langResult.languageConfidence,
        detectionSource: langResult.detectionSource,
        details: langResult,
      },
    });
  } catch (err: any) {
    console.error('Document Classification API error:', err);
    return NextResponse.json({ error: err.message || 'Document classification error' }, { status: 500 });
  }
}
