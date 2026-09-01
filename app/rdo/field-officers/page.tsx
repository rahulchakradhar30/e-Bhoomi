
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerDirectoryTable } from '@/components/tables/OfficerDirectoryTable';

export default function RdoFieldOfficersPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'RDO Workspace', href: '/rdo/dashboard' }, { label: 'Field Officers' }]} />
      <WorkspaceHeader title="DIVISIONAL FIELD OFFICERS DIRECTORY" subtitle="Village Revenue Officers Operating in Division" />
      <WorkspacePanel>
        <OfficerDirectoryTable />
      </WorkspacePanel>
    </div>
  );
}
