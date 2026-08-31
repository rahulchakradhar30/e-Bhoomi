export type DelegationStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface DelegationDocument {
  delegationId: string;
  issuerUid: string;
  targetUserUid: string;
  targetCaseId?: string;
  allowedActions: string[];
  reason: string;
  createdAt: string;
  expiresAt: string;
  status: DelegationStatus;
  auditReference: string;
}
