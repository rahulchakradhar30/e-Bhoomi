
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function StateDashboardPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="STATE LAND RECORD ADMINISTRATION DASHBOARD"
        subtitle="Apex State Monitoring, Kurnool District Inspection & Policy Management Console"
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">STATE JURISDICTION:</span>
        <span>{APP_CONFIG.activeState} (State LGD Code: {APP_CONFIG.activeStateCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span>ACTIVE MVP DISTRICT: {APP_CONFIG.activeDistrict} (LGD: {APP_CONFIG.activeDistrictCode})</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">ACTIVE DISTRICT</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">1</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">REVENUE DIVISIONS</span>
            <Building2 className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">3</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">MANDALS</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">21</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TOTAL OFFICERS</span>
            <Users className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">STATE AUDIT EVENTS</span>
            <ShieldCheck className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">0</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel title="STATE-WIDE DISTRICTS MONITORING" guidance="State-level progress tracking for Kurnool District.">
          <EmptyState title="Kurnool District Digitization Statistics" description="State-wide aggregated metrics will populate upon backend synchronization." />
        </WorkspacePanel>

        <WorkspacePanel title="STATE MASTER DATA & POLICY COMPLIANCE" guidance="LGD administrative hierarchy governance and state policy enforcement.">
          <EmptyState title="No Active Policy Flags" description="State administrative notices and policy rules will be displayed here." />
        </WorkspacePanel>
      </div>
    </div>
  );
}
