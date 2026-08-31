export type PermissionCode =
  | 'record.view'
  | 'record.create'
  | 'record.edit'
  | 'record.submit'
  | 'record.approve'
  | 'record.correct'
  | 'record.field_verify'
  | 'officer.view'
  | 'officer.create'
  | 'officer.assign'
  | 'officer.transfer'
  | 'officer.suspend'
  | 'masterdata.view'
  | 'masterdata.manage'
  | 'notification.create'
  | 'notification.publish'
  | 'audit.view';

export interface PermissionDefinition {
  code: PermissionCode;
  name: string;
  category: 'RECORDS' | 'OFFICERS' | 'MASTERDATA' | 'NOTIFICATIONS' | 'AUDIT';
  description: string;
}
