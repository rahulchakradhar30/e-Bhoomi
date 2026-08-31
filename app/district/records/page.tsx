'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function DistrictRecordsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'District Records' }]} />
      <WorkspaceHeader title="DISTRICT LAND RECORDS ARCHIVE" subtitle="Central Registry of Approved Land Records Across District Mandals" />
      <WorkspacePanel>
        <EmptyState title="District Land Registry Archive" description="All endorsed land records across district mandals will be searchable here." />
      </WorkspacePanel>
    </div>
  );
}
