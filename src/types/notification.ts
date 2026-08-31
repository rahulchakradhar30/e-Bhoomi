export type NotificationScope = 'GLOBAL' | 'STATE' | 'DISTRICT' | 'DIVISION' | 'MANDAL';
export type NotificationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface NotificationDocument {
  notificationId: string;
  title: string;
  body: string;
  scope: NotificationScope;
  createdBy: string;
  publishedAt: string | null;
  status: NotificationStatus;
  targetJurisdiction?: string;
  createdAt: string;
}
