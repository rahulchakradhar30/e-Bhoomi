
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { MasterDataBrowser } from '@/components/tables/MasterDataBrowser';

export default function AdminDistrictsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Districts' }]} />
      <WorkspaceHeader title="ADMINISTRATIVE DISTRICTS MASTER MANAGEMENT" subtitle="LGD District Codes & Boundaries Maintenance" />
      <WorkspacePanel>
        <MasterDataBrowser />
      </WorkspacePanel>
    </div>
  );
}
