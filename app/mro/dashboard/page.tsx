'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Eye,
  CheckSquare,
  ArrowRight,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { getCasesForJurisdiction } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';

export default function MroDashboardPage() {
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const fetched = await getCasesForJurisdiction(undefined, '5102');
        setCases(fetched);
      } catch (err) {
        console.error('Failed to load MRO dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const pendingApprovals = cases.filter(
    (c) => c.workflowStatus === 'PENDING_HIGHER_REVIEW' || c.workflowStatus === 'PENDING_VRO_REVIEW'
  );
  const approvedRecords = cases.filter(
    (c) => c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED'
  );
  const correctionsSent = cases.filter((c) => c.workflowStatus === 'CORRECTION_REQUIRED');
  const fieldVerifications = cases.filter((c) => c.fieldVerification?.photos?.length);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'MRO Workspace', href: '/mro/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="MANDAL REVENUE ADMINISTRATION DASHBOARD"
        subtitle="Jurisdictional Monitoring, Field Officer Management & Record Endorsement Console"
        action={
          <Link href="/mro/approvals" className="new-digitization-btn">
            <CheckSquare className="w-4 h-4" />
            <span>Review Pending Approvals ({pendingApprovals.length})</span>
          </Link>
        }
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">MANDAL JURISDICTION:</span>
        <span className="font-semibold">Kurnool Rural Mandal (LGD: 5102)</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">ASSIGNED VROs</span>
            <Users className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">8</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">PENDING APPROVALS</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">{pendingApprovals.length}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">APPROVED RECORDS</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{approvedRecords.length}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">CORRECTIONS SENT</span>
            <FileText className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{correctionsSent.length}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FIELD VERIFICATIONS</span>
            <ShieldCheck className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">{fieldVerifications.length}</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="PENDING MUTATION & DIGITIZATION APPROVALS"
          guidance="Records submitted by Village Revenue Officers for statutory endorsement."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading approval queue...</div>
          ) : pendingApprovals.length === 0 ? (
            <EmptyState
              title="No Pending Approvals"
              description="Submissions from subordinate Village Revenue Officers awaiting your endorsement will appear here."
            />
          ) : (
            <div className="dashboard-queue-list">
              {pendingApprovals.slice(0, 5).map((c) => (
                <div key={c.caseId} className="dashboard-queue-card">
                  <div className="dashboard-queue-info">
                    <div className="dashboard-queue-title">
                      <span>{c.extractedData?.ownerName?.value || 'Pattadar Record'}</span>
                      <span className="dashboard-queue-meta-pill">{c.documentType}</span>
                    </div>
                    <div className="dashboard-queue-meta">
                      <span className="text-navy font-bold">Ref: {c.caseId}</span>
                      <span>•</span>
                      <span>Sy: {c.extractedData?.surveyNumber?.value}/{c.extractedData?.subDivisionNumber?.value || '1'}</span>
                      <span>•</span>
                      <span>VRO: {c.createdBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="table-status-pill review">REQUIRES REVIEW</span>
                    <Link href={`/officer/history/${c.caseId}`} className="dashboard-action-link">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          title="SUBORDINATE FIELD OFFICER DIRECTORY"
          guidance="Field officers assigned to villages within this mandal."
        >
          <div className="dashboard-queue-list">
            {[
              { id: 'AP-545-VRO-00101', name: 'K. Rama Rao', village: 'Laxmipuram & Kallur', pending: pendingApprovals.length, status: 'Active' },
              { id: 'AP-545-VRO-00102', name: 'B. Venkat Reddy', village: 'Nidzur & Peddapadu', pending: 0, status: 'Active' },
              { id: 'AP-545-VRO-00103', name: 'M. Padmavathi', village: 'Ulchala & Munagalapadu', pending: 0, status: 'Active' },
              { id: 'AP-545-VRO-00104', name: 'S. Narayana', village: 'Gargeyapuram', pending: 0, status: 'Active' },
            ].map((vro) => (
              <div key={vro.id} className="dashboard-queue-card">
                <div className="dashboard-queue-info">
                  <div className="dashboard-queue-title">
                    <span>{vro.name}</span>
                    <span className="dashboard-queue-meta-pill">{vro.id}</span>
                  </div>
                  <div className="dashboard-queue-meta">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Jurisdiction: {vro.village}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="table-status-pill locked">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    {vro.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}
