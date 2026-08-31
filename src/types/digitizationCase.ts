export type CaseProcessingStatus = 'NEW' | 'PROCESSING' | 'PENDING_REVIEW' | 'COMPLETED' | 'REJECTED';
export type CaseOcrStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type CaseExtractionStatus = 'NOT_STARTED' | 'EXTRACTED' | 'VALIDATED' | 'REQUIRES_MANUAL_ENTRY';
export type CaseValidationStatus = 'PENDING' | 'PASSED' | 'FAILED_CHECKS';
export type CaseReviewStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'CORRECTION_REQUIRED';
export type CaseFieldVerificationStatus = 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'DISCREPANCY_FOUND';
export type CaseSubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'FINALIZED';

export interface DigitizationCaseDocument {
  caseId: string;
  createdBy: string;
  assignedOfficer: string | null;
  sourceDocumentId: string;
  documentType: string;
  processingStatus: CaseProcessingStatus;
  ocrStatus: CaseOcrStatus;
  extractionStatus: CaseExtractionStatus;
  validationStatus: CaseValidationStatus;
  reviewStatus: CaseReviewStatus;
  fieldVerificationStatus: CaseFieldVerificationStatus;
  submissionStatus: CaseSubmissionStatus;
  createdAt: string;
  updatedAt: string;
}
