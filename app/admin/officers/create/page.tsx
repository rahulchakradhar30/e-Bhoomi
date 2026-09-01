
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerCreateForm } from '@/components/forms/OfficerCreateForm';

export default function AdminOfficerCreatePage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'System Admin Console', href: '/admin/dashboard' },
          { label: 'Officer Directory', href: '/admin/officers' },
          { label: 'Provision New Officer' }
        ]}
      />
      <WorkspaceHeader title="PROVISION OFFICIAL REVENUE OFFICER CREDENTIALS" subtitle="Generate Official Login IDs Anchored in LGD Administrative Hierarchy" />
      <WorkspacePanel title="OFFICER PROVISIONING FORM" guidance="Select State, District, Mandal, and Role to auto-generate Official Login ID.">
        <OfficerCreateForm />
      </WorkspacePanel>
    </div>
  );
}
