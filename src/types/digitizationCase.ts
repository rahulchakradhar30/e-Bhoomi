import { DocumentCategoryCode, StructuredLandRecordData } from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { KYCStatus } from '@/lib/digitization/kycProvider';

export type DigitizationWorkflowStatus =
  | 'DRAFT'
  | 'CONSENT_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'PROCESSING'
  | 'OCR_COMPLETED'
  | 'AI_EXTRACTION_COMPLETED'
  | 'PENDING_VRO_REVIEW'
  | 'VRO_REVIEW_COMPLETED'
  | 'FIELD_VERIFICATION_PENDING'
  | 'FIELD_VERIFICATION_COMPLETED'
  | 'KYC_PENDING'
  | 'KYC_COMPLETED'
  | 'FINAL_REVIEW'
  | 'FINAL_SUBMITTED'
  | 'DIGITIZED'
  | 'PENDING_HIGHER_REVIEW'
  | 'REJECTED'
  | 'CORRECTION_REQUIRED';

export interface VROConsentRecord {
  consentVersion: string;
  consentLanguage: 'en' | 'te';
  consentAccepted: boolean;
  acceptedByOfficerId: string;
  acceptedByOfficerRole: string;
  acceptedAt: string;
  physicallyVerifiedDeclaration: boolean;
  aiReviewUnderstandingDeclaration: boolean;
  officerResponsibilityDeclaration: boolean;
}

export interface FinalConsentRecord {
  finalConsentAccepted: boolean;
  finalAcceptedAt: string;
  finalAcceptedBy: string;
  declarationText: string;
}

export interface DocumentUploadRecord {
  originalFileName: string;
  fileType: string;
  fileSizeBytes: number;
  pageCount: number;
  storageReference: string;
  uploadedAt: string;
  uploadedByOfficerId: string;
}

export interface FieldCorrectionAudit {
  fieldId: string;
  originalAIValue: string;
  correctedValue: string;
  correctionReason: string;
  correctedByOfficerId: string;
  correctedAt: string;
}

export interface VerificationChecklistState {
  [fieldId: string]: boolean;
}

export interface FieldVerificationPhoto {
  photoId: string;
  storageReference: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  caption?: string;
}

export interface FieldVerificationRecord {
  photos: FieldVerificationPhoto[];
  verifiedByOfficerId?: string;
  verifiedAt?: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  notes?: string;
}

export interface AuditTimelineEvent {
  eventId: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface DigitizationCaseDocument {
  caseId: string;
  createdBy: string;
  assignedOfficer: string | null;
  sourceDocumentId: string;
  documentType: DocumentCategoryCode;
  workflowStatus: DigitizationWorkflowStatus;
  
  // Backward compatibility fields
  processingStatus?: 'NEW' | 'PROCESSING' | 'PENDING_REVIEW' | 'COMPLETED' | 'REJECTED';
  ocrStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  extractionStatus?: 'NOT_STARTED' | 'EXTRACTED' | 'VALIDATED' | 'REQUIRES_MANUAL_ENTRY';
  validationStatus?: 'PENDING' | 'PASSED' | 'FAILED_CHECKS';
  reviewStatus?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'CORRECTION_REQUIRED';
  fieldVerificationStatus?: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'DISCREPANCY_FOUND';
  submissionStatus?: 'DRAFT' | 'SUBMITTED' | 'FINALIZED';

  // Jurisdiction Scope
  stateCode: string;
  districtCode: string;
  divisionCode: string;
  mandalCode: string;
  villageCode: string;

  // Phase Records
  initialConsent?: VROConsentRecord;
  finalConsent?: FinalConsentRecord;
  documentUpload?: DocumentUploadRecord;
  ocrResult?: OCRResult;
  extractedData?: StructuredLandRecordData;
  aiConfidenceScore?: number;
  corrections?: FieldCorrectionAudit[];
  checklist?: VerificationChecklistState;
  fieldVerification?: FieldVerificationRecord;
  kyc?: {
    status: KYCStatus;
    providerName: string;
    message: string;
  };

  auditTrail?: AuditTimelineEvent[];

  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}
