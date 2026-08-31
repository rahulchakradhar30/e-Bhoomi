/**
 * e-Bhoomi Multilingual Document & OCR AI Processing Service Boundary
 * 
 * Active Supported Languages: Telugu ('te') & English ('en')
 * Prepares service methods for future AI document processing integration.
 */
import { DocumentEntity } from '../types/backendContracts';

export const uploadDocument = async (file: File, documentFamily: string): Promise<{ success: boolean; documentId?: string }> => {
  // Backend API boundary: POST /api/v1/documents/upload
  return { success: true };
};

export const triggerOcrExtraction = async (documentId: string, language: 'te' | 'en' = 'te'): Promise<{
  success: boolean;
  extractedFields?: Record<string, string>;
  confidence?: number;
}> => {
  // Backend API boundary: POST /api/v1/documents/:id/extract-ocr
  return {
    success: true,
    confidence: 0.98
  };
};

export const getDocumentDetails = async (documentId: string): Promise<DocumentEntity | null> => {
  // Backend API boundary: GET /api/v1/documents/:id
  return null;
};
