'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AdminSecurityPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Security' }]} />
      <WorkspaceHeader title="SYSTEM SECURITY & THREAT MONITORING" subtitle="Authentication Policies, MFA Enforcement & Session Governance" />
      <WorkspacePanel title="SECURITY POLICY ENFORCEMENT" guidance="Configuration of system-wide security controls.">
        <div className="admin-form-grid">
          <div className="form-field-group">
            <label className="form-label">Multi-Factor Authentication (MFA)</label>
            <select className="form-select" defaultValue="ENFORCED_ADMINS">
              <option value="ENFORCED_ADMINS">Enforced for Admins & State Officers</option>
              <option value="ENFORCED_ALL">Enforced for All Revenue Roles</option>
            </select>
          </div>
          <div className="form-field-group">
            <label className="form-label">Session Idle Timeout</label>
            <select className="form-select" defaultValue="15">
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
            </select>
          </div>
        </div>
      </WorkspacePanel>
    </div>
  );
}
