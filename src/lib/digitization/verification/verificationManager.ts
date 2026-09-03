import {
  VerifiedLandRecord,
  VerifiedField,
  CorrectionAuditEntry,
  CorrectionReasonCode,
  DigitizationWorkflowState,
} from './verificationTypes';
import { AuditLedgerEngine } from './auditLedger';
import { WorkflowStateMachine } from './workflowStateMachine';

export class VerificationManager {
  public static VERSION = 'v6.0-VerificationManager';

  public createInitialVerifiedRecord(params: {
    digitizationId: string;
    sourceExtractionId: string;
    sourceValidationId?: string;
    sourceCrossVerificationId?: string;
    documentType: string;
    officerId: string;
    officerRole: string;
    extractedFields: Record<string, any>;
  }): VerifiedLandRecord {
    const verifiedFields: Record<string, VerifiedField> = {};
    const timestamp = new Date().toISOString();

    for (const [key, val] of Object.entries(params.extractedFields)) {
      verifiedFields[key] = {
        fieldId: key,
        fieldLabelEn: key,
        fieldLabelTe: key,
        aiValue: val ? String(val) : null,
        verifiedValue: val ? String(val) : null,
        decision: 'UNVERIFIED',
        verifiedByOfficerId: params.officerId,
        verifiedAt: timestamp,
      };
    }

    const record: VerifiedLandRecord = {
      verifiedRecordId: `VREC-${Date.now()}`,
      digitizationId: params.digitizationId,
      sourceExtractionId: params.sourceExtractionId,
      sourceValidationId: params.sourceValidationId,
      sourceCrossVerificationId: params.sourceCrossVerificationId,
      documentType: params.documentType,
      verifiedFields,
      correctionHistory: [],
      workflowState: 'VRO_REVIEW',
      verifiedByOfficerId: params.officerId,
      officerRole: params.officerRole,
      jurisdiction: { districtCode: '545', mandalCode: '5103', villageCode: '600101' },
      verificationVersion: 1,
      auditReference: `AUD-REF-${params.digitizationId}`,
      isLocked: false,
    };

    AuditLedgerEngine.createAuditEvent({
      digitizationId: params.digitizationId,
      entityType: 'VerifiedLandRecord',
      entityId: record.verifiedRecordId,
      eventType: 'REVIEW_STARTED',
      actorId: params.officerId,
      actorRole: params.officerRole,
      newStateReference: 'VRO_REVIEW',
    });

    return record;
  }

  public acceptField(
    record: VerifiedLandRecord,
    fieldId: string,
    officerId: string,
    officerRole: string
  ): VerifiedLandRecord {
    if (record.isLocked) {
      throw new Error(`Record ${record.verifiedRecordId} is FINALIZED and locked. Direct edits prohibited.`);
    }

    const field = record.verifiedFields[fieldId];
    if (!field) throw new Error(`Field '${fieldId}' not found in record.`);

    field.decision = 'AI_ACCEPTED';
    field.verifiedValue = field.aiValue;
    field.verifiedByOfficerId = officerId;
    field.verifiedAt = new Date().toISOString();

    AuditLedgerEngine.createAuditEvent({
      digitizationId: record.digitizationId,
      entityType: 'VerifiedField',
      entityId: fieldId,
      eventType: 'FIELD_ACCEPTED',
      actorId: officerId,
      actorRole: officerRole,
      field: fieldId,
      beforeValue: field.aiValue,
      afterValue: field.aiValue,
      reason: 'VRO accepted AI extraction value.',
    });

    return record;
  }

  public correctField(params: {
    record: VerifiedLandRecord;
    fieldId: string;
    correctedValue: string;
    reasonCode: CorrectionReasonCode;
    reasonText: string;
    officerId: string;
    officerRole: string;
    authorityLevel?: string;
  }): VerifiedLandRecord {
    const { record, fieldId, correctedValue, reasonCode, reasonText, officerId, officerRole, authorityLevel } = params;

    if (record.isLocked) {
      throw new Error(`Record ${record.verifiedRecordId} is FINALIZED and locked. Direct edits prohibited.`);
    }
    if (!reasonText || !reasonText.trim()) {
      throw new Error(`Correction Reason is mandatory when modifying field '${fieldId}'.`);
    }

    const field = record.verifiedFields[fieldId];
    const oldValue = field ? field.verifiedValue || field.aiValue : null;

    if (field) {
      field.decision = 'CORRECTED';
      field.verifiedValue = correctedValue;
      field.correctionReasonCode = reasonCode;
      field.correctionReasonText = reasonText;
      field.verifiedByOfficerId = officerId;
      field.verifiedAt = new Date().toISOString();
    }

    const auditEntry: CorrectionAuditEntry = {
      version: record.correctionHistory.length + 1,
      fieldId,
      oldValue,
      newValue: correctedValue,
      reasonCode,
      reasonText,
      changedByOfficerId: officerId,
      officerRole,
      changedAt: new Date().toISOString(),
      authorityLevel: authorityLevel || officerRole,
    };

    record.correctionHistory.push(auditEntry);
    record.verificationVersion += 1;

    AuditLedgerEngine.createAuditEvent({
      digitizationId: record.digitizationId,
      entityType: 'VerifiedField',
      entityId: fieldId,
      eventType: 'FIELD_CORRECTED',
      actorId: officerId,
      actorRole: officerRole,
      field: fieldId,
      beforeValue: oldValue,
      afterValue: correctedValue,
      reason: `[${reasonCode}] ${reasonText}`,
    });

    return record;
  }

  public finalizeRecord(record: VerifiedLandRecord, officerId: string, officerRole: string): VerifiedLandRecord {
    WorkflowStateMachine.assertTransition(record.workflowState, 'FINALIZED');

    record.workflowState = 'FINALIZED';
    record.isLocked = true;
    record.finalizedAt = new Date().toISOString();

    AuditLedgerEngine.createAuditEvent({
      digitizationId: record.digitizationId,
      entityType: 'VerifiedLandRecord',
      entityId: record.verifiedRecordId,
      eventType: 'FINALIZED',
      actorId: officerId,
      actorRole: officerRole,
      newStateReference: 'FINALIZED',
      reason: 'Land record digitization finalized and locked by authorized officer.',
    });

    return record;
  }
}
