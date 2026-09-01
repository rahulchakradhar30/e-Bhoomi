
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';

export default function AdminSettingsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Settings' }]} />
      <WorkspaceHeader title="SYSTEM CONFIGURATION & INFRASTRUCTURE SETTINGS" subtitle="Global e-Bhoomi Application Runtime & Portal Parameters" />
      <WorkspacePanel title="GLOBAL SYSTEM PARAMETERS" guidance="Environment configuration and runtime settings for Next.js server node.">
        <div className="admin-form-grid">
          <div className="form-field-group">
            <label className="form-label">Application Runtime Environment</label>
            <input type="text" className="form-input" value="Next.js 15 App Router (Node.js)" readOnly />
          </div>
          <div className="form-field-group">
            <label className="form-label">Authoritative Data Seed Source</label>
            <input type="text" className="form-input" value="Local Government Directory (LGD) Ministry of Panchayati Raj" readOnly />
          </div>
        </div>
      </WorkspacePanel>
    </div>
  );
}
