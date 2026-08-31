'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { AuditTimeline } from '@/components/tables/AuditTimeline';

export default function StateAuditPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Audit Log' }]} />
      <WorkspaceHeader title="STATE SECURITY & AUDIT TRAIL" subtitle="Statutory Immutable Event Log Stream Across All State Jurisdictions" />
      <WorkspacePanel>
        <AuditTimeline />
      </WorkspacePanel>
    </div>
  );
}
