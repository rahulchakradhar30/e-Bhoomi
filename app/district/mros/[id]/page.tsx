import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SubordinateWorkspaceViewer } from '@/components/workspace/SubordinateWorkspaceViewer';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function DistrictMroDetailViewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'District Workspace', href: '/district/dashboard' },
          { label: 'MRO / Tahsildars', href: '/district/mros' },
          { label: 'MRO Subordinate Inspection' }
        ]}
      />
      <WorkspaceHeader title="SUBORDINATE MRO WORKSPACE INSPECTION" subtitle="View-Only Administrative Inspection Mode for District Collector" />
      <SubordinateWorkspaceViewer
        subordinateTitle="Mandal Revenue Office Workspace"
        subordinateJurisdiction="Mandal Revenue Office"
        viewerRole="District Collector & District Magistrate"
      >
        <EmptyState
          title="MRO Workspace Inspection Active"
          description="Accessing subordinate Mandal Revenue Office workspace in read-only administrative mode."
        />
      </SubordinateWorkspaceViewer>
    </div>
  );
}
