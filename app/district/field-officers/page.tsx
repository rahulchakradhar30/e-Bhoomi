'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerDirectoryTable } from '@/components/tables/OfficerDirectoryTable';

export default function DistrictFieldOfficersPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'Field Officers' }]} />
      <WorkspaceHeader title="DISTRICT FIELD OFFICERS DIRECTORY" subtitle="Village Revenue Officers & Field Surveyors in District" />
      <WorkspacePanel>
        <OfficerDirectoryTable />
      </WorkspacePanel>
    </div>
  );
}
