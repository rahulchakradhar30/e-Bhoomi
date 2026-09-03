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
    const refId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const storageReference = cloudinaryStorage.createStorageReference(
      `vro_digitization_${documentType.toLowerCase()}`,
      refId,
      file.name
    );

    // Calculate page count estimate for PDF vs Image
    const isPdf = file.type === 'application/pdf';
    const estimatedPages = isPdf ? Math.max(1, Math.ceil(file.size / 180000)) : 1;

    return NextResponse.json({
      success: true,
      storageReference,
      originalFileName: file.name,
      fileType: file.type,
      fileSizeBytes: file.size,
      pageCount: estimatedPages,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Server upload API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error during upload.' }, { status: 500 });
  }
}
