import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/storage';

export interface StorageUploadResult {
  storagePath: string;
  downloadUrl: string;
  fileSizeBytes: number;
}

/**
 * Upload original source document preserving immutable reference.
 * Path structure: /documents/{stateId}/{districtId}/{caseId}/original/{filename}
 */
export async function uploadOriginalSourceDocument(
  file: File,
  stateId: string,
  districtId: string,
  caseId: string
): Promise<StorageUploadResult> {
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `documents/${stateId}/${districtId}/${caseId}/original/${Date.now()}_${sanitizedFilename}`;
  const fileRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      caseId,
      stateId,
      districtId,
      immutable: 'true',
    },
  };

  const uploadResult = await uploadBytes(fileRef, file, metadata);
  const downloadUrl = await getDownloadURL(uploadResult.ref);

  return {
    storagePath,
    downloadUrl,
    fileSizeBytes: file.size,
  };
}

/**
 * Gets secure download URL for a storage object path.
 */
export async function getDocumentDownloadUrl(storagePath: string): Promise<string> {
  const fileRef = ref(storage, storagePath);
  return await getDownloadURL(fileRef);
}
