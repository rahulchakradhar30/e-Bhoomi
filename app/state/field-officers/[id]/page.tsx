'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SubordinateWorkspaceViewer } from '@/components/workspace/SubordinateWorkspaceViewer';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function StateFieldOfficerDetailViewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'State Workspace', href: '/state/dashboard' },
          { label: 'Field Officers', href: '/state/field-officers' },
          { label: 'Field Officer Subordinate Inspection' }
        ]}
      />
      <WorkspaceHeader title="SUBORDINATE FIELD OFFICER WORKSPACE INSPECTION" subtitle="View-Only Administrative Inspection Mode for State Authority" />
      <SubordinateWorkspaceViewer
        subordinateTitle="Village Revenue Office Workspace"
        subordinateJurisdiction="Village Revenue Office"
        viewerRole="State Land Records Commissioner"
      >
        <EmptyState
          title="Field Officer Activity Stream"
          description="Subordinate workspace view active in statutory inspection mode."
        />
      </SubordinateWorkspaceViewer>
    </div>
  );
}
