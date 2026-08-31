'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { MasterDataBrowser } from '@/components/tables/MasterDataBrowser';

export default function StateAdministrativeDataPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Administrative Data' }]} />
      <WorkspaceHeader title="STATE LGD ADMINISTRATIVE MASTER DATA" subtitle="Authoritative Local Government Directory (LGD) State Seed Layers" />
      <WorkspacePanel>
        <MasterDataBrowser />
      </WorkspacePanel>
    </div>
  );
}
