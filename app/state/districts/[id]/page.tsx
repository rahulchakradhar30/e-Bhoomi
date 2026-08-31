'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { SubordinateWorkspaceViewer } from '@/components/workspace/SubordinateWorkspaceViewer';
import { EmptyState } from '@/components/workspace/EmptyState';

export default function StateDistrictDetailViewPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'State Workspace', href: '/state/dashboard' },
          { label: 'Districts', href: '/state/districts' },
          { label: 'District Subordinate Inspection' }
        ]}
      />
      <WorkspaceHeader title="SUBORDINATE DISTRICT WORKSPACE INSPECTION" subtitle="View-Only Administrative Inspection Mode for State Authority" />
      <SubordinateWorkspaceViewer
        subordinateTitle="District Collector Workspace"
        subordinateJurisdiction="District Administration Office"
        viewerRole="State Land Records Commissioner"
      >
        <EmptyState
          title="District Collector Workspace Active"
          description="Accessing subordinate District Collector workspace in read-only administrative inspection mode."
        />
      </SubordinateWorkspaceViewer>
    </div>
  );
}
