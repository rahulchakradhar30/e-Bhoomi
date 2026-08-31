import { UserRole } from './role';

export type OfficerAccountStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'SUSPENDED';

export interface OfficerProfile {
  officerId: string;
  authUid: string;
  name: string;
  designation: string;
  roleId: UserRole;
  stateId: string;
  districtId: string;
  revenueDivisionId?: string;
  mandalOrTalukId?: string;
  assignedJurisdictionIds: string[];
  officialEmail: string;
  officialMobile: string;
  accountStatus: OfficerAccountStatus;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}
