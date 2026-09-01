
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { MasterDataBrowser } from '@/components/tables/MasterDataBrowser';

export default function AdminMasterDataPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Master Data' }]} />
      <WorkspaceHeader title="LOCAL GOVERNMENT DIRECTORY (LGD) MASTER DATA BROWSER" subtitle="Authoritative Government Administrative Geometry Seed Datasets" />
      <WorkspacePanel>
        <MasterDataBrowser />
      </WorkspacePanel>
    </div>
  );
}
