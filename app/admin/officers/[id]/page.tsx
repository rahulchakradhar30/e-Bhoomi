'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function AdminOfficerDetailPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'System Admin Console', href: '/admin/dashboard' },
          { label: 'Officer Directory', href: '/admin/officers' },
          { label: 'Officer Details' }
        ]}
      />
      <WorkspaceHeader title="OFFICER PROFILE & JURISDICTION ASSIGNMENT" subtitle="Manage Officer Account Status, Credential Reset & Transfers" />
      <WorkspacePanel>
        <EmptyState title="Officer Profile Record" description="Select an active officer from the directory to inspect details." />
      </WorkspacePanel>
    </div>
  );
}
