
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, FileText, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function DistrictDashboardPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="KURNOOL DISTRICT LAND RECORD ADMINISTRATION DASHBOARD"
        subtitle="District-Wide Land Records Modernization & Revenue Administration Console"
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">DISTRICT JURISDICTION:</span>
        <span>{APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span>{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">MANDALS</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TAHSILDARS / MROs</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TOTAL RECORDS</span>
            <FileText className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">AUDIT EXCEPTIONS</span>
            <ShieldCheck className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel title="MANDAL PERFORMANCE MONITORING" guidance="Progress tracking across mandal revenue offices in Kurnool District.">
          <EmptyState title="District Mandals Summary" description="Performance analytics across Kurnool mandals will populate here upon backend synchronization." />
        </WorkspacePanel>

        <WorkspacePanel title="DISTRICT LAND RECORDS AUDIT" guidance="High-level audit monitoring for land record modifications in Kurnool.">
          <EmptyState title="No Active Audit Exceptions" description="District-wide security and audit events will appear here." />
        </WorkspacePanel>
      </div>
    </div>
  );
}
