
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { MasterDataBrowser } from '@/components/tables/MasterDataBrowser';

export default function AdminRevenueDivisionsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Revenue Divisions' }]} />
      <WorkspaceHeader title="REVENUE DIVISIONS MASTER MANAGEMENT" subtitle="LGD Revenue Divisions (RDO Courts Jurisdiction)" />
      <WorkspacePanel>
        <MasterDataBrowser />
      </WorkspacePanel>
    </div>
  );
}
