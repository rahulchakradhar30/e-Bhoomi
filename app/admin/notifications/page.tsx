
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function AdminNotificationsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Notifications' }]} />
      <WorkspaceHeader title="SYSTEM NOTIFICATIONS BROADCAST" subtitle="System-Wide Operational Broadcasts & Maintenance Announcements" />
      <WorkspacePanel>
        <EmptyState title="No Active System Notifications" description="System notifications and maintenance announcements will appear here." />
      </WorkspacePanel>
    </div>
  );
}
