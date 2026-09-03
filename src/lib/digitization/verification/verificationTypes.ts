export type DigitizationWorkflowState =
  | 'DRAFT'
  | 'PROCESSING'
  | 'AI_COMPLETE'
  | 'VALIDATION_COMPLETE'
  | 'REVIEW_REQUIRED'
  | 'VRO_REVIEW'
  | 'RETURNED'
  | 'ESCALATED'
  | 'HIGHER_OFFICER_REVIEW'
  | 'APPROVED'
  | 'FINALIZED'
  | 'REOPEN_REQUESTED'
  | 'REOPENED';

export type FieldVerificationDecision =
  | 'AI_ACCEPTED'
  | 'CORRECTED'
  | 'REJECTED'
  | 'UNVERIFIED'
  | 'NOT_APPLICABLE';

export type CorrectionReasonCode =
  | 'OCR_ERROR'
  | 'HANDWRITING_MISREAD'
  | 'TRANSLATION_ERROR'
  | 'EXTRACTION_ERROR'
  | 'DOCUMENT_CONTEXT_ERROR'
  | 'MASTER_DATA_MISMATCH'
  | 'CROSS_DATABASE_MISMATCH'
  | 'LEGACY_FORMAT'
  | 'MISSING_SOURCE_CONTEXT'
  | 'MANUAL_VERIFICATION'
  | 'OTHER';

export interface VerifiedField {
  fieldId: string;
  fieldLabelEn: string;
  fieldLabelTe: string;
  aiValue?: string | null;
  verifiedValue?: string | null;
  decision: FieldVerificationDecision;
  correctionReasonCode?: CorrectionReasonCode;
  correctionReasonText?: string;
  confidenceScore?: number;
  sourceEvidenceReference?: string;
  verifiedByOfficerId: string;
  verifiedAt: string;
}

export interface CorrectionAuditEntry {
  version: number;
  fieldId: string;
  oldValue?: string | null;
  newValue?: string | null;
  reasonCode: CorrectionReasonCode;
  reasonText: string;
  changedByOfficerId: string;
  officerRole: string;
  changedAt: string;
  authorityLevel: string;
  sourceEvidenceReference?: string;
}

export interface VerifiedLandRecord {
  verifiedRecordId: string;
  digitizationId: string;
  sourceExtractionId: string;
  sourceValidationId?: string;
  sourceCrossVerificationId?: string;
  documentType: string;
  verifiedFields: Record<string, VerifiedField>;
  correctionHistory: CorrectionAuditEntry[];
  workflowState: DigitizationWorkflowState;
  verifiedByOfficerId: string;
  officerRole: string;
  jurisdiction: {
    districtCode?: string;
    mandalCode?: string;
    villageCode?: string;
    secretariatCode?: string;
  };
  verificationVersion: number;
  auditReference: string;
  isLocked: boolean;
  finalizedAt?: string;
}

export type AuditEventType =
  | 'DOCUMENT_UPLOADED'
  | 'PROCESSING_STARTED'
  | 'PROCESSING_COMPLETED'
  | 'OCR_COMPLETED'
  | 'EXTRACTION_COMPLETED'
  | 'CONFIDENCE_GENERATED'
  | 'VALIDATION_COMPLETED'
  | 'CROSS_DATABASE_COMPLETED'
  | 'DUPLICATE_DETECTED'
  | 'CONFLICT_DETECTED'
  | 'REVIEW_STARTED'
  | 'FIELD_ACCEPTED'
  | 'FIELD_CORRECTED'
  | 'FIELD_REJECTED'
  | 'OFFICER_SUBMITTED'
  | 'OFFICER_RETURNED'
  | 'ESCALATED'
  | 'APPROVED'
  | 'FINALIZED'
  | 'REOPENED';

export interface AuditEvent {
  auditEventId: string;
  digitizationId: string;
  entityType: string;
  entityId: string;
  eventType: AuditEventType;
  actorId: string;
  actorRole: string;
  timestamp: string;
  previousStateReference?: string;
  newStateReference?: string;
  field?: string;
  beforeValue?: string | null;
  afterValue?: string | null;
  reason?: string;
  sourceReference?: string;
  validationReference?: string;
  verificationReference?: string;
  eventHash: string;
  previousEventHash: string;
}
