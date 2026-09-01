
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerDirectoryTable } from '@/components/tables/OfficerDirectoryTable';

export default function DistrictMrosPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'MRO / Tahsildars' }]} />
      <WorkspaceHeader title="DISTRICT TAHSILDARS / MROS DIRECTORY" subtitle="All Mandal Revenue Officers Operating in District" />
      <WorkspacePanel>
        <OfficerDirectoryTable />
      </WorkspacePanel>
    </div>
  );
}
