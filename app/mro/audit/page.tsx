
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { AuditTimeline } from '@/components/tables/AuditTimeline';

export default function MroAuditPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'MRO Workspace', href: '/mro/dashboard' }, { label: 'Audit Log' }]} />
      <WorkspaceHeader title="MANDAL SECURITY & AUDIT TRAIL" subtitle="Statutory Immutable Event Logs for Mandal Operations" />
      <WorkspacePanel>
        <AuditTimeline />
      </WorkspacePanel>
    </div>
  );
}
