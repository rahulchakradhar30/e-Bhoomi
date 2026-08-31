'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { AuditTimeline } from '@/components/tables/AuditTimeline';

export default function RdoAuditPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'RDO Workspace', href: '/rdo/dashboard' }, { label: 'Audit Log' }]} />
      <WorkspaceHeader title="REVENUE DIVISION AUDIT LOG" subtitle="Statutory Immutable Event Stream for Divisional Operations" />
      <WorkspacePanel>
        <AuditTimeline />
      </WorkspacePanel>
    </div>
  );
}
