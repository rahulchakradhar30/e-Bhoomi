
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { JurisdictionDirectory } from '@/components/tables/JurisdictionDirectory';

export default function AdminJurisdictionsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Jurisdictions' }]} />
      <WorkspaceHeader title="JURISDICTION DIRECTORY & CUSTOM BOUNDARY MAPPINGS" subtitle="LGD Administrative Boundaries & Custom Jurisdictional Assignments" />
      <WorkspacePanel>
        <JurisdictionDirectory />
      </WorkspacePanel>
    </div>
  );
}
