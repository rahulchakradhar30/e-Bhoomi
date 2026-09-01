
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerDirectoryTable } from '@/components/tables/OfficerDirectoryTable';

export default function StateMrosPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'MRO / Tahsildars' }]} />
      <WorkspaceHeader title="STATE TAHSILDARS / MROS DIRECTORY" subtitle="Mandal Revenue Officers Operating Across State Mandals" />
      <WorkspacePanel>
        <OfficerDirectoryTable />
      </WorkspacePanel>
    </div>
  );
}
