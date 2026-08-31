'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SubordinateWorkspaceViewer } from '@/components/workspace/SubordinateWorkspaceViewer';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function RdoMroDetailViewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'RDO Workspace', href: '/rdo/dashboard' },
          { label: 'Tahsildars / MROs', href: '/rdo/mros' },
          { label: 'MRO Subordinate Inspection' }
        ]}
      />
      <WorkspaceHeader title="SUBORDINATE MRO WORKSPACE INSPECTION" subtitle="View-Only Inspection Mode for Revenue Divisional Officer" />
      <SubordinateWorkspaceViewer
        subordinateTitle="Mandal Revenue Office Workspace"
        subordinateJurisdiction="Mandal Revenue Office"
        viewerRole="Revenue Divisional Officer (RDO)"
      >
        <EmptyState
          title="MRO Workspace Operational Stream"
          description="Subordinate MRO workspace active in read-only inspection mode."
        />
      </SubordinateWorkspaceViewer>
    </div>
  );
}
