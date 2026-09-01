import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SubordinateWorkspaceViewer } from '@/components/workspace/SubordinateWorkspaceViewer';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function StateMroDetailViewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'State Workspace', href: '/state/dashboard' },
          { label: 'MRO / Tahsildars', href: '/state/mros' },
          { label: 'MRO Subordinate Inspection' }
        ]}
      />
      <WorkspaceHeader title="SUBORDINATE MRO WORKSPACE INSPECTION" subtitle="View-Only Administrative Inspection Mode for State Authority" />
      <SubordinateWorkspaceViewer
        subordinateTitle="Mandal Revenue Office Workspace"
        subordinateJurisdiction="Mandal Revenue Office"
        viewerRole="State Land Records Commissioner"
      >
        <EmptyState
          title="MRO Workspace Inspection Active"
          description="Accessing subordinate Mandal Revenue Office workspace in read-only administrative mode."
        />
      </SubordinateWorkspaceViewer>
    </div>
  );
}
