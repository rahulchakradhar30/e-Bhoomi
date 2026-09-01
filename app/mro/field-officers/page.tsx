
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerDirectoryTable } from '@/components/tables/OfficerDirectoryTable';

export default function MroFieldOfficersPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'MRO Workspace', href: '/mro/dashboard' }, { label: 'Field Officers' }]} />
      <WorkspaceHeader title="SUBORDINATE FIELD OFFICERS DIRECTORY" subtitle="Village Revenue Officers & Revenue Inspectors Assigned to Mandal" />
      <WorkspacePanel>
        <OfficerDirectoryTable />
      </WorkspacePanel>
    </div>
  );
}
