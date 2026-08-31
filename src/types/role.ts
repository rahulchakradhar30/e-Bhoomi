export type UserRole =
  | 'SYSTEM_ADMIN'
  | 'STATE_ADMIN'
  | 'DISTRICT_ADMIN'
  | 'RDO'
  | 'MRO'
  | 'FIELD_OFFICER'
  | 'PUBLIC_USER'
  // Legacy roles for backward compatibility
  | 'DISTRICT_COLLECTOR'
  | 'DISTRICT_DEPUTY_COMMISSIONER'
  | 'RDO_OFFICER'
  | 'AC_OFFICER'
  | 'TAHSILDAR_MRO'
  | 'TAHSILDAR'
  | 'FIELD_VRO'
  | 'FIELD_VA';

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  jurisdictionLevel: 'NATION' | 'STATE' | 'DISTRICT' | 'REVENUE_DIVISION' | 'MANDAL' | 'VILLAGE' | 'CITIZEN';
  defaultPermissions: string[];
}

export const SYSTEM_ROLES: Partial<Record<UserRole, RoleDefinition>> = {
  SYSTEM_ADMIN: {
    id: 'SYSTEM_ADMIN',
    name: 'System Administrator',
    description: 'Full infrastructure and application administration privilege.',
    jurisdictionLevel: 'NATION',
    defaultPermissions: ['*'],
  },
  STATE_ADMIN: {
    id: 'STATE_ADMIN',
    name: 'State Administrator',
    description: 'State-level administrative authority and configuration management.',
    jurisdictionLevel: 'STATE',
    defaultPermissions: ['masterdata.*', 'officer.view', 'officer.create', 'audit.view', 'notification.publish'],
  },
  DISTRICT_ADMIN: {
    id: 'DISTRICT_ADMIN',
    name: 'District Collector / Admin',
    description: 'District-level administration, officer management, and monitoring.',
    jurisdictionLevel: 'DISTRICT',
    defaultPermissions: ['record.view', 'officer.view', 'officer.assign', 'audit.view', 'notification.publish'],
  },
  RDO: {
    id: 'RDO',
    name: 'Revenue Divisional Officer',
    description: 'Divisional supervision, escalation review, and approval.',
    jurisdictionLevel: 'REVENUE_DIVISION',
    defaultPermissions: ['record.view', 'record.approve', 'officer.view', 'audit.view'],
  },
  MRO: {
    id: 'MRO',
    name: 'Mandal Revenue Officer (Tahsildar)',
    description: 'Mandal land record approval and mutation authority.',
    jurisdictionLevel: 'MANDAL',
    defaultPermissions: ['record.view', 'record.approve', 'record.correct', 'officer.view'],
  },
  FIELD_OFFICER: {
    id: 'FIELD_OFFICER',
    name: 'Field Verification Officer (VRO/VA)',
    description: 'Village-level field verification and data entry.',
    jurisdictionLevel: 'VILLAGE',
    defaultPermissions: ['record.view', 'record.create', 'record.edit', 'record.submit', 'record.field_verify'],
  },
  PUBLIC_USER: {
    id: 'PUBLIC_USER',
    name: 'Public Citizen',
    description: 'Public land record viewer and applicant.',
    jurisdictionLevel: 'CITIZEN',
    defaultPermissions: ['record.view'],
  },
};
