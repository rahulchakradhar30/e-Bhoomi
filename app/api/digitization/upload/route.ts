import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryStorage } from '@/lib/storage/cloudinaryService';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('documentType') as string) || 'ADANGAL';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Server-side file validation
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid file format (${file.type}). Supported: PDF, JPG, JPEG, PNG.` },
        { status: 400 }
      );
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 25MB.' },
        { status: 400 }
      );
    }

    // Generate secure Cloudinary storage reference ID
    const refId = `DOC-${Date.now()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const storageReference = cloudinaryStorage.createStorageReference(
      `vro_digitization_${documentType.toLowerCase()}`,
      refId,
      file.name
    );

    // Calculate REAL page count from file binary content
    const isPdf = file.type === 'application/pdf';
    let actualPageCount = 1;

    if (isPdf) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const text = new TextDecoder('latin1').decode(bytes);

      if (!text.startsWith('%PDF-')) {
        return NextResponse.json(
          { error: 'Corrupt or invalid PDF format. Document does not contain valid PDF header.' },
          { status: 400 }
        );
      }

      // 1. Try finding /Count in Pages dictionary
      const countMatches = [...text.matchAll(/\/Count\s+(\d+)/g)];
      if (countMatches.length > 0) {
        // The root Pages node usually contains the maximum /Count value
        const counts = countMatches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n) && n > 0);
        if (counts.length > 0) {
          actualPageCount = Math.max(...counts);
        }
      }

      // 2. Fallback: Count /Type /Page instances (excluding /Pages)
      if (actualPageCount === 1) {
        const pageMatches = text.match(/\/Type\s*\/Page(?=[^a-zA-Z])/g);
        if (pageMatches && pageMatches.length > 0) {
          actualPageCount = pageMatches.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      storageReference,
      originalFileName: file.name,
      fileType: file.type,
      fileSizeBytes: file.size,
      pageCount: actualPageCount,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Server upload API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error during upload.' }, { status: 500 });
  }
}
