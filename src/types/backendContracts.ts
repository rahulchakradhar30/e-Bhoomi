/**
 * e-Bhoomi Database & API Data Contracts
 * 
 * Formal TypeScript interfaces for PostgreSQL / Node.js backend integration.
 * Keeps data contracts decoupled from presentation layer components.
 */

export interface StateEntity {
  id: string;
  stateCode: string; // Government LGD code e.g. "28"
  displayCode: string; // e.g. "AP"
  name: string;
  localName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface DistrictEntity {
  id: string;
  districtCode: string; // Government LGD code e.g. "545"
  stateCode: string; // Foreign Key to State
  displayCode: string; // e.g. "KUR"
  name: string;
  localName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface RevenueDivisionEntity {
  id: string;
  divisionCode: string; // e.g. "RD-545-01"
  districtCode: string; // Foreign Key to District
  stateCode: string;
  name: string;
  localName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface MandalEntity {
  id: string;
  mandalCode: string; // LGD Subdistrict Code e.g. "5101"
  divisionCode: string; // Foreign Key to Revenue Division
  districtCode: string; // Foreign Key to District
  stateCode: string;
  name: string;
  localName: string;
  type: 'Mandal' | 'Taluk';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface VillageEntity {
  id: string;
  villageCode: string; // LGD Village Code e.g. "600101"
  mandalCode: string; // Foreign Key to Mandal
  districtCode: string;
  stateCode: string;
  name: string;
  localName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type RoleCode = 
  | 'STATE_ADMIN'
  | 'DISTRICT_COLLECTOR'
  | 'RDO_OFFICER'
  | 'TAHSILDAR_MRO'
  | 'FIELD_VRO'
  | 'SYSTEM_ADMIN';

export interface PermissionEntity {
  id: string;
  permissionCode: string;
  description: string;
  module: 'MASTER_DATA' | 'OFFICERS' | 'RECORDS' | 'WORKFLOW' | 'AUDIT' | 'SECURITY';
}

export interface RoleEntity {
  id: string;
  roleCode: RoleCode;
  name: string;
  description: string;
  jurisdictionLevel: 'STATE' | 'DISTRICT' | 'REVENUE_DIVISION' | 'MANDAL' | 'VILLAGE';
  permissions: PermissionEntity[];
}

export interface JurisdictionEntity {
  id: string;
  level: 'STATE' | 'DISTRICT' | 'REVENUE_DIVISION' | 'MANDAL' | 'VILLAGE';
  stateCode: string;
  districtCode?: string;
  divisionCode?: string;
  mandalCode?: string;
  villageCode?: string;
  displayName: string;
}

export interface OfficerEntity {
  id: string;
  loginId: string; // e.g. AP-545-VRO-00101
  governmentCode?: string; // Government identity number
  displayCode?: string;
  fullName: string;
  designation: string;
  email: string;
  mobile: string;
  roleCode: RoleCode;
  jurisdiction: JurisdictionEntity;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'SUSPENDED';
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentEntity {
  id: string;
  documentNumber: string;
  family: 'ADANGAL' | 'ROR_1B' | 'MUTATION' | 'PARTITION' | 'OTHER';
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storageUrl: string;
  uploadedByOfficerId: string;
  ocrExtractedText?: string;
  ocrLanguage?: 'te' | 'en';
  confidenceScore?: number;
  createdAt: string;
}

export interface LandRecordEntity {
  id: string;
  recordNumber: string;
  surveyNumber: string;
  subdivisionNumber?: string;
  pattadarName: string;
  pattadarFatherName?: string;
  extentAcres: number;
  landType: 'DRY' | 'WET' | 'INAM' | 'GOVERNMENT';
  villageCode: string;
  mandalCode: string;
  districtCode: string;
  stateCode: string;
  workflowState: WorkflowStateEntity;
  documents: DocumentEntity[];
  createdAt: string;
  updatedAt: string;
}

export type WorkflowStep = 
  | 'DRAFT'
  | 'AI_EXTRACTED'
  | 'VRO_VERIFIED'
  | 'FIELD_VERIFIED'
  | 'MRO_APPROVED'
  | 'ENDORSED'
  | 'REJECTED';

export interface WorkflowStateEntity {
  id: string;
  recordId: string;
  currentStep: WorkflowStep;
  assignedOfficerId?: string;
  assignedRole: RoleCode;
  remarks?: string;
  lastUpdatedByOfficerId: string;
  updatedAt: string;
}

export interface AuditEventEntity {
  id: string;
  timestamp: string;
  actorOfficerId: string;
  actorLoginId: string;
  actorRole: RoleCode;
  action: string;
  targetEntity: string;
  targetEntityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}
