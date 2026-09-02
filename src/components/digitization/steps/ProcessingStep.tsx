'use client';

import React from 'react';
import { DocumentUploadRecord } from '@/types/digitizationCase';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult, DefaultAIExtractionProvider } from '@/lib/digitization/aiExtractionProvider';
import { ProcessingPipelineWorkspace } from '../ProcessingPipelineWorkspace';
import { NormalizedDocumentRepresentation } from '@/types/documentProcessingJob';

interface ProcessingStepProps {
  uploadRecord: DocumentUploadRecord;
  documentType: DocumentCategoryCode;
  onProcessingCompleted: (ocrResult: OCRResult, aiResult: AIExtractionResult) => void;
  onRetry: () => void;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  uploadRecord,
  documentType,
  onProcessingCompleted,
  onRetry,
}) => {
  const handlePipelineCompleted = async (normDoc: NormalizedDocumentRepresentation) => {
    // Generate AI extraction result for Phase 1 transition into review stage
    const aiProvider = new DefaultAIExtractionProvider();
    const aiResult = await aiProvider.extractStructuredData(
      normDoc.ocr,
      normDoc.finalDocumentType as DocumentCategoryCode
    );

    onProcessingCompleted(normDoc.ocr, aiResult);
  };

  return (
    <ProcessingPipelineWorkspace
      uploadRecord={uploadRecord}
      vroSelectedDocumentType={documentType}
      onPipelineCompleted={handlePipelineCompleted}
      onRetryUpload={onRetry}
    />
  );
};
