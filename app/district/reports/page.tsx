'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function DistrictReportsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'Reports' }]} />
      <WorkspaceHeader title="DISTRICT DIGITIZATION & REVENUE REPORTS" subtitle="District-Wide Progress Analytics & Mandals Performance Breakdown" />
      <WorkspacePanel>
        <EmptyState title="District Analytics Console" description="District level progress reports will generate automatically upon backend sync." />
      </WorkspacePanel>
    </div>
  );
}
