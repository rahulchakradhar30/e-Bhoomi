
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function OfficerRecordsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Field Officer Workspace', href: '/officer/dashboard' }, { label: 'My Records' }]} />
      <WorkspaceHeader title="MY LAND RECORDS REGISTRY" subtitle="All Land Records Managed in Assigned Jurisdiction" />
      <WorkspacePanel>
        <EmptyState title="No Records Archived" description="Land records created or verified in your jurisdiction will be listed here." />
      </WorkspacePanel>
    </div>
  );
}
