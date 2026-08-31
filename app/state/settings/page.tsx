'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';

export default function StateSettingsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Settings' }]} />
      <WorkspaceHeader title="STATE SYSTEM CONFIGURATION" subtitle="State Land Record Digitization Policies & Workflow Configurations" />
      <WorkspacePanel title="STATE POLICY CONFIGURATIONS" guidance="Configure state-specific rules, password policies, and RBAC parameters.">
        <div className="admin-form-grid">
          <div className="form-field-group">
            <label className="form-label">Mandatory Field Inspection Rule</label>
            <select className="form-select" defaultValue="REQUIRED_ALL">
              <option value="REQUIRED_ALL">Required for All New Digitizations</option>
              <option value="SAMPLE_BASED">Sample-Based 20% Random Audit</option>
            </select>
          </div>
          <div className="form-field-group">
            <label className="form-label">Dual-Signoff Requirement for Mutations</label>
            <select className="form-select" defaultValue="ENABLED">
              <option value="ENABLED">Enabled (VRO Endorsement + MRO Approval)</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        </div>
      </WorkspacePanel>
    </div>
  );
}
