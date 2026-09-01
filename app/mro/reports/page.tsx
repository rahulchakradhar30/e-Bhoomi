
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function MroReportsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'MRO Workspace', href: '/mro/dashboard' }, { label: 'Reports' }]} />
      <WorkspaceHeader title="MANDAL DIGITIZATION & REVENUE REPORTS" subtitle="Progress Analytics for Mandal Land Records Modernization" />
      <WorkspacePanel>
        <EmptyState title="Statistical Reports Console" description="Mandal level progress reports will generate automatically upon backend aggregation." />
      </WorkspacePanel>
    </div>
  );
}
