
import React from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { ShieldCheck, FileText, CheckCircle2, Clock, MapPin, Users } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function MroDashboardPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'MRO Workspace', href: '/mro/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="MANDAL REVENUE ADMINISTRATION DASHBOARD"
        subtitle="Jurisdictional Monitoring, Field Officer Management & Record Endorsement Console"
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">MANDAL JURISDICTION:</span>
        <span>Kurnool Urban Mandal (LGD: 5101)</span>
        <span className="jurisdiction-sep">|</span>
        <span>{APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span>{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">SUBORDINATE VROs</span>
            <Users className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">PENDING APPROVALS</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">APPROVED RECORDS</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">CORRECTIONS SENT</span>
            <FileText className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FIELD VERIFICATIONS</span>
            <ShieldCheck className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">0</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel title="PENDING MUTATION & DIGITIZATION APPROVALS" guidance="Records submitted by Village Revenue Officers for statutory endorsement.">
          <EmptyState
            title="No Pending Approvals"
            description="Submissions from subordinate Village Revenue Officers awaiting your endorsement will appear here."
          />
        </WorkspacePanel>

        <WorkspacePanel title="SUBORDINATE FIELD OFFICER DIRECTORY" guidance="Field officers assigned to villages within this mandal.">
          <EmptyState
            title="No Field Officers Assigned"
            description="Field revenue officers assigned to villages under this mandal jurisdiction will be listed here."
          />
        </WorkspacePanel>
      </div>
    </div>
  );
}
