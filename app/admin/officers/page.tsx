'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { OfficerDirectoryTable } from '@/components/tables/OfficerDirectoryTable';
import { UserPlus } from 'lucide-react';

export default function AdminOfficersPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Officer Directory' }]} />
      <WorkspaceHeader
        title="SYSTEM OFFICERS DIRECTORY"
        subtitle="Provisioned Official User Accounts Across All Revenue Jurisdictions"
        action={
          <Link href="/admin/officers/create" className="new-digitization-btn">
            <UserPlus className="w-4 h-4" />
            <span>Provision Officer Account</span>
          </Link>
        }
      />
      <WorkspacePanel>
        <OfficerDirectoryTable />
      </WorkspacePanel>
    </div>
  );
}
