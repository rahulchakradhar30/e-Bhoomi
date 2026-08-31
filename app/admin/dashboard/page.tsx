'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { ShieldCheck, UserPlus, Database, Lock, Users, Layers } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function AdminDashboardPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="SYSTEM ADMINISTRATION CONTROL CONSOLE"
        subtitle="Master Data Infrastructure, Officer Provisioning & System Security Management"
        action={
          <Link href="/admin/officers/create" className="new-digitization-btn">
            <UserPlus className="w-4 h-4" />
            <span>Provision Officer Account</span>
          </Link>
        }
      />

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">MASTER LGD DATASET</span>
            <Database className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">1</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">OFFICER ACCOUNTS</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">JURISDICTIONS</span>
            <Layers className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">ACTIVE ROLES</span>
            <ShieldCheck className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">6</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">SECURITY STATUS</span>
            <Lock className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">OK</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel title="MASTER DATA SEED STATUS" guidance="Local Government Directory (LGD) State, District, Division, Mandal, and Village datasets.">
          <div className="ai-stats-list">
            <div className="ai-stat-row">
              <span className="ai-stat-label">{APP_CONFIG.activeState} LGD Data ({APP_CONFIG.activeStateShortCode}-{APP_CONFIG.activeStateCode})</span>
              <span className="ai-stat-value text-green">LOADED ({APP_CONFIG.activeDistrict} District - LGD {APP_CONFIG.activeDistrictCode})</span>
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="SYSTEM SECURITY AUDIT STREAM" guidance="Real-time administrative actions and authentication security events.">
          <EmptyState title="Security Audit Log Active" description="Security logs will stream here during system operations." />
        </WorkspacePanel>
      </div>
    </div>
  );
}
