import { NextRequest, NextResponse } from 'next/server';
import { DefaultPreprocessingPipeline } from '@/lib/digitization/preprocessingPipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceFile } = body;

    if (!sourceFile) {
      return NextResponse.json({ error: 'Missing sourceFile object' }, { status: 400 });
    }

    const pipeline = new DefaultPreprocessingPipeline();
    const pages = await pipeline.executePreprocessing(
      sourceFile.originalFileName,
      sourceFile.fileSizeBytes,
      sourceFile.pageCount,
      sourceFile.fileType
    );

    return NextResponse.json({
      success: true,
      preprocessedPages: pages,
      preprocessingStatus: 'COMPLETED',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Preprocessing API error:', err);
    return NextResponse.json({ error: err.message || 'Preprocessing error' }, { status: 500 });
  }
}
