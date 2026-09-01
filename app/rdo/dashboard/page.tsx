
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, FileText, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function RdoDashboardPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'RDO Workspace', href: '/rdo/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="REVENUE DIVISION ADMINISTRATION DASHBOARD"
        subtitle="Divisional Supervision, Appellate Disputes & Mandal Monitoring Console"
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">REVENUE DIVISION JURISDICTION:</span>
        <span>Kurnool Revenue Division (RD-545-01)</span>
        <span className="jurisdiction-sep">|</span>
        <span>{APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span>{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">SUBORDINATE MROs</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FIELD OFFICERS</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">APPELLATE CASES</span>
            <FileText className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">AUDIT ALERTS</span>
            <ShieldCheck className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel title="SUBORDINATE MANDAL REVENUE OFFICES" guidance="Monitoring performance across mandals under this division in Kurnool District.">
          <EmptyState title="No Active Mandal Summaries" description="Mandal revenue offices within Kurnool division will be monitored here." />
        </WorkspacePanel>

        <WorkspacePanel title="DIVISIONAL APPELLATE & MUTATION CASES" guidance="Statutory appellate disputes and high-value land matters.">
          <EmptyState title="No Divisional Appeals Pending" description="Appellate cases submitted to RDO level will appear here." />
        </WorkspacePanel>
      </div>
    </div>
  );
}
