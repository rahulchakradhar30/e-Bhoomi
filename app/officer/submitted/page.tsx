
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function OfficerSubmittedPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Field Officer Workspace', href: '/officer/dashboard' }, { label: 'Submitted Records' }]} />
      <WorkspaceHeader title="SUBMITTED RECORDS ARCHIVE" subtitle="Records Transmitted to Tahsildar / MRO for Final Approval" />
      <WorkspacePanel>
        <EmptyState title="No Records Submitted Yet" description="Records endorsed and transmitted to MRO will be archived here." />
      </WorkspacePanel>
    </div>
  );
}
