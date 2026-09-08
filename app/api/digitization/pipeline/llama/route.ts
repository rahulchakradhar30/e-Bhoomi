import { NextRequest, NextResponse } from 'next/server';
import { LlamaDocumentTextProvider } from '@/lib/digitization/llama/llamaDocumentTextProvider';
import { cloudinaryStorage } from '@/lib/storage/cloudinaryService';
import { DefaultPreprocessingPipeline } from '@/lib/digitization/preprocessingPipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceFile, preprocessedPages, documentType } = body;

    const llamaProvider = new LlamaDocumentTextProvider();

    // 1. Health check
    const health = await llamaProvider.healthCheck();
    if (!health.configured) {
      return NextResponse.json(
        {
          success: false,
          status: 'LLAMA_KEY_MISSING',
          error: 'LLAMA_API_KEY is not configured on the server. Please set LLAMA_API_KEY in the environment.',
          model: health.model,
        },
        { status: 400 }
      );
    }

    let pagesToProcess = preprocessedPages;

    // 2. If preprocessedPages not provided or empty, retrieve real document bytes from storage and preprocess
    if (!pagesToProcess || pagesToProcess.length === 0) {
      if (!sourceFile?.storageReference) {
        return NextResponse.json(
          { error: 'Missing preprocessedPages or valid storageReference in sourceFile' },
          { status: 400 }
        );
      }

      const storedDoc = await cloudinaryStorage.retrieveDocument(sourceFile.storageReference);
      if (!storedDoc) {
        return NextResponse.json(
          { error: `Document retrieval failed for storage reference: ${sourceFile.storageReference}` },
          { status: 404 }
        );
      }

      const pipeline = new DefaultPreprocessingPipeline();
      pagesToProcess = await pipeline.executePreprocessing(
        storedDoc.fileName,
        storedDoc.buffer.byteLength,
        sourceFile.pageCount || 1,
        storedDoc.mimeType,
        storedDoc.buffer
      );
    }

    let fileBuffer: ArrayBuffer | undefined = undefined;
    let mimeType = sourceFile?.fileType || 'application/pdf';
    let fileName = sourceFile?.originalFileName || 'document.pdf';

    if (sourceFile?.storageReference) {
      const storedDoc = await cloudinaryStorage.retrieveDocument(sourceFile.storageReference);
      if (storedDoc) {
        fileBuffer = storedDoc.buffer;
        mimeType = storedDoc.mimeType || mimeType;
        fileName = storedDoc.fileName || fileName;
      }
    }

    const llamaResult = await llamaProvider.extractTextFromPages(
      pagesToProcess,
      {
        documentType: documentType || 'ADANGAL',
        fileName,
        fileBuffer,
        mimeType,
      }
    );

    if (!llamaResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: llamaResult.error || 'Llama document text extraction failed',
          status: llamaResult.status || 'EXTRACTION_FAILED',
          llamaResult,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'COMPLETED',
      llamaResult,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Llama Pipeline API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during Llama text extraction' },
      { status: 500 }
    );
  }
}
