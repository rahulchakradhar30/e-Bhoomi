import crypto from 'crypto';

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  createdAt: string;
}

export class CloudinaryStorageService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'e-bhoomi';
    this.apiKey = process.env.CLOUDINARY_API_KEY || '';
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  }

  /**
   * Generates a signed Cloudinary upload reference for server-side upload.
   * Ensures CLOUDINARY_API_SECRET remains strictly server-side.
   */
  public generateSignedUploadParams(folder: string = 'vro_digitization_documents'): {
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    folder: string;
  } {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    
    // Generate HMAC SHA-1 signature using API secret
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + this.apiSecret)
      .digest('hex');

    return {
      timestamp,
      signature,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder,
    };
  }

  /**
   * Creates a structured Cloudinary storage reference URI for database persistence.
   */
  public createStorageReference(folder: string, refId: string, fileName: string): string {
    return `cloudinary://${this.cloudName}/${folder}/${refId}/${fileName}`;
  }

  /**
   * Stores document bytes in server-side storage keyed by storageReference.
   */
  public async storeDocument(
    storageReference: string,
    buffer: ArrayBuffer,
    mimeType: string,
    fileName: string
  ): Promise<void> {
    const store = this._getServerStore();
    store.set(storageReference, {
      buffer,
      mimeType,
      fileName,
      storedAt: Date.now(),
    });
  }

  /**
   * Retrieves document bytes by storageReference.
   * Returns null if not found or expired.
   */
  public async retrieveDocument(
    storageReference: string
  ): Promise<{ buffer: ArrayBuffer; mimeType: string; fileName: string } | null> {
    if (!storageReference) return null;
    const store = this._getServerStore();
    const item = store.get(storageReference);
    if (!item) return null;
    return {
      buffer: item.buffer,
      mimeType: item.mimeType,
      fileName: item.fileName,
    };
  }

  private _getServerStore(): Map<string, { buffer: ArrayBuffer; mimeType: string; fileName: string; storedAt: number }> {
    const globalAny = globalThis as any;
    if (!globalAny.__SERVER_DOCUMENT_STORE__) {
      globalAny.__SERVER_DOCUMENT_STORE__ = new Map<
        string,
        { buffer: ArrayBuffer; mimeType: string; fileName: string; storedAt: number }
      >();
    }
    return globalAny.__SERVER_DOCUMENT_STORE__;
  }
}

export const cloudinaryStorage = new CloudinaryStorageService();
