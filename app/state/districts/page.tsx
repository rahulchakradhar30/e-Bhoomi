'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { MasterDataBrowser } from '@/components/tables/MasterDataBrowser';

export default function StateDistrictsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Districts' }]} />
      <WorkspaceHeader title="STATE DISTRICTS REGISTRY" subtitle="All Administrative Districts Under State Revenue Authority" />
      <WorkspacePanel>
        <MasterDataBrowser />
      </WorkspacePanel>
    </div>
  );
}
