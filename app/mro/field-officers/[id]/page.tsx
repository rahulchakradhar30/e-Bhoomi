'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SubordinateWorkspaceViewer } from '@/components/workspace/SubordinateWorkspaceViewer';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function MroFieldOfficerDetailViewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'MRO Workspace', href: '/mro/dashboard' },
          { label: 'Field Officers', href: '/mro/field-officers' },
          { label: 'Officer Subordinate Inspection' }
        ]}
      />
      <WorkspaceHeader title="SUBORDINATE FIELD OFFICER WORKSPACE INSPECTION" subtitle="View-Only Inspection Mode for Mandal Revenue Officer" />
      <SubordinateWorkspaceViewer
        subordinateTitle="VRO Field Office Workspace"
        subordinateJurisdiction="Village Revenue Office"
        viewerRole="Mandal Revenue Officer (MRO)"
      >
        <EmptyState
          title="Field Officer Activity Stream"
          description="Subordinate workspace view active in statutory inspection mode."
        />
      </SubordinateWorkspaceViewer>
    </div>
  );
}
