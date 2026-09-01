
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerDirectoryTable } from '@/components/tables/OfficerDirectoryTable';

export default function RdoMrosPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'RDO Workspace', href: '/rdo/dashboard' }, { label: 'Tahsildars / MROs' }]} />
      <WorkspaceHeader title="SUBORDINATE MANDAL REVENUE OFFICERS DIRECTORY" subtitle="MROs & Tahsildars Operating Within Revenue Division" />
      <WorkspacePanel>
        <OfficerDirectoryTable />
      </WorkspacePanel>
    </div>
  );
}
