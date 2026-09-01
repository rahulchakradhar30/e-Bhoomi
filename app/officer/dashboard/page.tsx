
import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { FileUp, ShieldCheck, FileText, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function OfficerDashboardPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Field Officer Workspace', href: '/officer/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="VILLAGE REVENUE OFFICER DASHBOARD"
        subtitle="Operational Summary & Land Record Digitization Workspace"
        action={
          <Link href="/officer/digitization/new" className="new-digitization-btn">
            <FileUp className="w-4 h-4" />
            <span>New Digitization Entry</span>
          </Link>
        }
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">ASSIGNED JURISDICTION:</span>
        <span>{APP_CONFIG.activeState} ({APP_CONFIG.activeStateShortCode}-{APP_CONFIG.activeStateCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span>{APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span>Kurnool Rural Mandal (LGD: 5102)</span>
      </div>

      {/* Summary Statistics Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TOTAL SUBMITTED</span>
            <FileText className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">AI PROCESSED</span>
            <ShieldCheck className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">PENDING REVIEW</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FIELD VERIFICATION</span>
            <MapPin className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">0</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">APPROVED BY MRO</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">0</div>
        </div>
      </div>

      {/* Split Operational Panels */}
      <div className="operational-split-grid">
        <WorkspacePanel title="DIGITIZATION PIPELINE QUEUE" guidance="Recent document uploads and AI extraction processing status.">
          <EmptyState
            title="Digitization Queue Empty"
            description="Upload physical land records to initiate AI multi-lingual OCR extraction and verification."
          />
        </WorkspacePanel>

        <WorkspacePanel title="FIELD VERIFICATION TASKS" guidance="Assigned field inspection and boundary verification tasks.">
          <EmptyState
            title="No Pending Field Inspections"
            description="Field verification requests assigned by Tahsildar/MRO will appear here."
          />
        </WorkspacePanel>
      </div>
    </div>
  );
}
