import { UserRole } from './role';

export interface AuditLogDocument {
  id: string;
  timestamp: string;
  actorUid: string;
  actorLoginId?: string;
  actorRole: UserRole;
  action: string;
  resourceId?: string;
  resourceCollection?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}
