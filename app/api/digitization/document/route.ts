import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryStorage } from '@/lib/storage/cloudinaryService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');

    if (!ref) {
      return NextResponse.json({ error: 'Missing document storage reference (ref)' }, { status: 400 });
    }

    const doc = await cloudinaryStorage.retrieveDocument(ref);

    if (!doc || !doc.buffer) {
      return NextResponse.json({ error: 'Document not found in storage' }, { status: 404 });
    }

    const mimeType = doc.mimeType || 'application/pdf';
    const fileName = doc.fileName || 'document.pdf';

    return new NextResponse(doc.buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Document stream error:', err);
    return NextResponse.json({ error: err.message || 'Failed to stream document' }, { status: 500 });
  }
}
