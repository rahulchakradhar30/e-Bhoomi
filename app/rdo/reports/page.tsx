'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function RdoReportsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'RDO Workspace', href: '/rdo/dashboard' }, { label: 'Reports' }]} />
      <WorkspaceHeader title="REVENUE DIVISION DIGITIZATION REPORTS" subtitle="Divisional Performance Metrics & Mandals Comparison" />
      <WorkspacePanel>
        <EmptyState title="Divisional Analytics Console" description="Aggregated revenue division reports will display upon backend sync." />
      </WorkspacePanel>
    </div>
  );
}
