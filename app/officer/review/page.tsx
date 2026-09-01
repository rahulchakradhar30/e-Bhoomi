
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function OfficerReviewQueuePage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Field Officer Workspace', href: '/officer/dashboard' }, { label: 'Pending Review' }]} />
      <WorkspaceHeader title="PENDING REVIEW QUEUE" subtitle="Records Awaiting Field Officer Verification" />
      <WorkspacePanel>
        <EmptyState title="Review Queue Empty" description="Records awaiting verification will appear here." />
      </WorkspacePanel>
    </div>
  );
}
