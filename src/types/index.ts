export * from './role';
export * from './permission';
export * from './user';
export * from './officer';
export * from './jurisdiction';
export * from './landRecord';
export * from './digitizationCase';
export * from './delegation';
export * from './audit';
export * from './notification';
export * from './backendContracts';

export interface AdministrativeLocation {
  stateCode: string;
  stateName: string;
  districtCode?: string;
  districtName?: string;
  divisionCode?: string;
  divisionName?: string;
  subdistrictCode?: string;
  subdistrictName?: string;
  villageCode?: string;
  villageName?: string;
  lgdCode?: string;
}

export interface Jurisdiction {
  id: string;
  stateCode: string;
  districtCode?: string;
  divisionCode?: string;
  subdistrictCode?: string;
  villageCode?: string;
  level: 'STATE' | 'DISTRICT' | 'DIVISION' | 'SUBDISTRICT' | 'VILLAGE';
  name: string;
}

export interface Officer {
  id: string;
  loginId: string;
  fullName: string;
  role: string;
  designation: string;
  email: string;
  mobile: string;
  jurisdiction: Jurisdiction;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'SUSPENDED';
  createdAt?: string;
}

export type DocumentType = 
  | 'ROR_1B'
  | 'MUTATION_ORDER'
  | 'FIELD_BOOK_FMB'
  | 'LAND_GRANT_CERTIFICATE'
  | 'PATTADAR_PASSBOOK'
  | 'SURVEY_RECORD';

export type DocumentStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_PROCESSED'
  | 'PENDING_REVIEW'
  | 'FIELD_VERIFICATION_REQUIRED'
  | 'CORRECTION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type WorkflowStatus = 
  | 'NEW'
  | 'IN_PROGRESS'
  | 'PENDING_APPROVAL'
  | 'RETURNED'
  | 'COMPLETED';

export interface Delegation {
  active: boolean;
  targetUser?: string;
  targetCaseId?: string;
  requestedAction?: string;
  reason?: string;
  authorizationReference?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorLoginId: string;
  actorRole: string;
  action: string;
  resourceId?: string;
  ipAddress?: string;
  details?: string;
}

export interface AdministrativeMetadata {
  source: string;
  source_authority?: string;
  dataset_version: string;
  last_updated: string;
  imported_at: string;
  source_reference: string;
  supported_states: string[];
}
