
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function RdoCasesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'RDO Workspace', href: '/rdo/dashboard' }, { label: 'Division Cases' }]} />
      <WorkspaceHeader title="REVENUE DIVISION APPELLATE DOCKET" subtitle="Statutory Land Disputes, Appeals & High-Value Mutations" />
      <WorkspacePanel>
        <EmptyState title="No Divisional Appeals Pending" description="Appellate cases referred to the RDO court will appear here." />
      </WorkspacePanel>
    </div>
  );
}
