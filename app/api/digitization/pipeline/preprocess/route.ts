import { NextRequest, NextResponse } from 'next/server';
import { DefaultPreprocessingPipeline } from '@/lib/digitization/preprocessingPipeline';
import { cloudinaryStorage } from '@/lib/storage/cloudinaryService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceFile } = body;

    if (!sourceFile) {
      return NextResponse.json({ error: 'Missing sourceFile object' }, { status: 400 });
    }

    let fileBuffer: ArrayBuffer | undefined = undefined;
    let mimeType = sourceFile.fileType || 'application/pdf';
    let fileName = sourceFile.originalFileName || 'document.pdf';

    // Retrieve real document bytes from storage reference
    if (sourceFile.storageReference) {
      const storedDoc = await cloudinaryStorage.retrieveDocument(sourceFile.storageReference);
      if (storedDoc) {
        fileBuffer = storedDoc.buffer;
        mimeType = storedDoc.mimeType || mimeType;
        fileName = storedDoc.fileName || fileName;
      }
    }

    const pipeline = new DefaultPreprocessingPipeline();
    const pages = await pipeline.executePreprocessing(
      fileName,
      fileBuffer ? fileBuffer.byteLength : sourceFile.fileSizeBytes,
      sourceFile.pageCount,
      mimeType,
      fileBuffer
    );

    console.log(`[OPENCV] page processed (count: ${pages.length})`);

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
