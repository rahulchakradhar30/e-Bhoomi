'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { AuditTimeline } from '@/components/tables/AuditTimeline';

export default function AdminAuditPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Audit Trail' }]} />
      <WorkspaceHeader title="NATIONAL AUDIT TRAIL STREAM" subtitle="Immutable Central Security Audit Log for System Operations" />
      <WorkspacePanel>
        <AuditTimeline />
      </WorkspacePanel>
    </div>
  );
}
