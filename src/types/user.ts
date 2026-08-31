import { UserRole } from './role';

export type UserAccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface UserProfile {
  uid: string;
  email: string | null;
  mobile: string | null;
  role: UserRole;
  status: UserAccountStatus;
  jurisdictionId: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
}
