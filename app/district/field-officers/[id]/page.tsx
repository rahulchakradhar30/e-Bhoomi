import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SubordinateWorkspaceViewer } from '@/components/workspace/SubordinateWorkspaceViewer';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function DistrictFieldOfficerDetailViewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'District Workspace', href: '/district/dashboard' },
          { label: 'Field Officers', href: '/district/field-officers' },
          { label: 'Field Officer Subordinate Inspection' }
        ]}
      />
      <WorkspaceHeader title="SUBORDINATE FIELD OFFICER WORKSPACE INSPECTION" subtitle="View-Only Administrative Inspection Mode for District Collector" />
      <SubordinateWorkspaceViewer
        subordinateTitle="Village Revenue Office Workspace"
        subordinateJurisdiction="Village Revenue Office"
        viewerRole="District Collector & District Magistrate"
      >
        <EmptyState
          title="Field Officer Activity Stream"
          description="Subordinate workspace view active in statutory inspection mode."
        />
      </SubordinateWorkspaceViewer>
    </div>
  );
}
