
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';

export default function AdminRolesPage() {
  const roles = [
    { id: 'STATE_ADMIN', label: 'State Administrator', scope: 'Full State Administration Scope' },
    { id: 'DISTRICT_COLLECTOR', label: 'District Collector / District Magistrate', scope: 'District-Wide Administration Scope' },
    { id: 'RDO_OFFICER', label: 'Revenue Divisional Officer (RDO)', scope: 'Revenue Division Scope' },
    { id: 'TAHSILDAR_MRO', label: 'Tahsildar / Mandal Revenue Officer (MRO)', scope: 'Mandal Revenue Scope' },
    { id: 'FIELD_VRO', label: 'Village Revenue Officer (VRO)', scope: 'Village Revenue Scope' },
    { id: 'SYSTEM_ADMIN', label: 'System Administrator', scope: 'System Infrastructure Console' }
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Roles & Permissions' }]} />
      <WorkspaceHeader title="ROLE-BASED ACCESS CONTROL (RBAC) REGISTRY" subtitle="Statutory Revenue Administrative Roles & Access Scope Definitions" />
      <WorkspacePanel title="REGISTERED ADMINISTRATIVE ROLES" guidance="Hierarchical permission matrix governing view/act boundaries.">
        <div className="table-responsive-wrapper">
          <table className="officer-records-table">
            <thead>
              <tr>
                <th>Role Code</th>
                <th>Role Title</th>
                <th>Jurisdictional Scope</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r, idx) => (
                <tr key={idx}>
                  <td><code className="text-navy">{r.id}</code></td>
                  <td><strong>{r.label}</strong></td>
                  <td>{r.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkspacePanel>
    </div>
  );
}
