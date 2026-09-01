
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function StateReportsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Reports' }]} />
      <WorkspaceHeader title="STATE DIGITIZATION & REVENUE ANALYTICS" subtitle="Apex Analytics, State Progress Reports & National Comparisons" />
      <WorkspacePanel>
        <EmptyState title="State Progress Analytics Console" description="State progress reports will compile automatically upon backend synchronization." />
      </WorkspacePanel>
    </div>
  );
}
