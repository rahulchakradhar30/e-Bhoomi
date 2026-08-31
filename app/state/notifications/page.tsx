'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function StateNotificationsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Notifications' }]} />
      <WorkspaceHeader title="STATE ADMINISTRATIVE NOTIFICATIONS" subtitle="State-Wide Circulars, Statutory Rules & Emergency Alerts" />
      <WorkspacePanel>
        <EmptyState title="No Active State Circulars" description="Official notifications dispatched to district revenue offices will appear here." />
      </WorkspacePanel>
    </div>
  );
}
