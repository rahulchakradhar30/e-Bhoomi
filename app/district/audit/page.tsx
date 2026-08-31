'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { AuditTimeline } from '@/components/tables/AuditTimeline';

export default function DistrictAuditPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'Audit Log' }]} />
      <WorkspaceHeader title="DISTRICT SECURITY & AUDIT TRAIL" subtitle="Statutory Immutable Event Stream for District Operations" />
      <WorkspacePanel>
        <AuditTimeline />
      </WorkspacePanel>
    </div>
  );
}
