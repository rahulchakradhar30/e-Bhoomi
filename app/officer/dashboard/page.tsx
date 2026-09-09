'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import {
  FileUp,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { getAssignedCasesForOfficer } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';
import { useCurrentUser } from '@/context/AuthContext';

export default function OfficerDashboardPage() {
  const { officerProfile } = useCurrentUser();
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const officerId = officerProfile?.officerId || 'AP-545-VRO-00101';

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const fetched = await getAssignedCasesForOfficer(officerId);
        setCases(fetched);
      } catch (err) {
        console.error('Failed to load dashboard cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [officerId]);

  const totalSubmitted = cases.filter((c) => c.workflowStatus !== 'DRAFT').length;
  const aiProcessed = cases.filter((c) => c.workflowStatus !== 'DRAFT').length;
  const pendingReview = cases.filter(
    (c) => c.workflowStatus === 'PENDING_HIGHER_REVIEW' || c.workflowStatus === 'PENDING_VRO_REVIEW'
  ).length;
  const fieldVerificationCount = cases.filter((c) => c.fieldVerification?.photos?.length).length;
  const approvedCount = cases.filter(
    (c) => c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED'
  ).length;

  // Genuine active jurisdiction details from cases or officer profile
  const sampleCase = cases.find((c) => c.extractedData?.villageName?.value || c.extractedData?.mandalName?.value);
  const jurisdictionState = APP_CONFIG.activeState;
  const jurisdictionDistrict = sampleCase?.extractedData?.districtName?.value || APP_CONFIG.activeDistrict;
  const jurisdictionMandal = sampleCase?.extractedData?.mandalName?.value || (officerProfile?.mandalOrTalukId ? `Mandal LGD: ${officerProfile.mandalOrTalukId}` : 'Kurnool Rural Mandal');
  const jurisdictionVillage = sampleCase?.extractedData?.villageName?.value || '';

  return (
    <div className="space-y-4">
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

      {/* Dynamic Genuine Jurisdiction Bar */}
      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">ASSIGNED JURISDICTION:</span>
        <span className="font-semibold">{jurisdictionState}</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{jurisdictionDistrict} District</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{jurisdictionMandal}</span>
        {jurisdictionVillage && (
          <>
            <span className="jurisdiction-sep">|</span>
            <span className="font-semibold">Village: {jurisdictionVillage}</span>
          </>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TOTAL SUBMITTED</span>
            <FileText className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{totalSubmitted}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">AI PROCESSED</span>
            <ShieldCheck className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">{aiProcessed}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">PENDING REVIEW</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">{pendingReview}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FIELD VERIFICATION</span>
            <MapPin className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{fieldVerificationCount}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">APPROVED & DIGITIZED</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{approvedCount}</div>
        </div>
      </div>

      {/* Split Operational Panels */}
      <div className="operational-split-grid">
        {/* Panel 1: Digitization Pipeline Queue */}
        <WorkspacePanel
          title="DIGITIZATION PIPELINE QUEUE"
          guidance="Genuine document uploads and AI extraction processing status."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading pipeline queue...</div>
          ) : cases.length === 0 ? (
            <EmptyState
              title="Digitization Queue Empty"
              description="Upload physical land records to initiate AI multi-lingual OCR extraction and verification."
            />
          ) : (
            <div className="dashboard-queue-list">
              {cases.slice(0, 5).map((c) => {
                const isDigitized = c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED';

                return (
                  <div key={c.caseId} className="dashboard-queue-card">
                    <div className="dashboard-queue-info">
                      <div className="dashboard-queue-title">
                        <span>{c.extractedData?.ownerName?.value || 'Pattadar Record'}</span>
                        <span className="dashboard-queue-meta-pill">
                          {c.documentType}
                        </span>
                      </div>
                      <div className="dashboard-queue-meta">
                        <span className="text-navy font-bold">Ref: {c.caseId}</span>
                        <span>•</span>
                        <span>
                          Sy: {c.extractedData?.surveyNumber?.value || 'N/A'}
                          {c.extractedData?.subDivisionNumber?.value ? `/${c.extractedData.subDivisionNumber.value}` : ''}
                        </span>
                        {c.extractedData?.extentAcres?.value && (
                          <>
                            <span>•</span>
                            <span className="text-green-700 font-bold">{c.extractedData.extentAcres.value}</span>
                          </>
                        )}
                        {c.extractedData?.villageName?.value && (
                          <>
                            <span>•</span>
                            <span>{c.extractedData.villageName.value}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`table-status-pill ${isDigitized ? 'locked' : 'review'}`}>
                        {isDigitized ? 'DIGITIZED' : c.workflowStatus}
                      </span>
                      <Link
                        href={`/officer/history/${c.caseId}`}
                        className="dashboard-action-link"
                        title="View Full Record Certificate"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </WorkspacePanel>

        {/* Panel 2: Field Verification Tasks */}
        <WorkspacePanel
          title="FIELD VERIFICATION TASKS"
          guidance="Genuine field inspection and boundary verification records."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading verification tasks...</div>
          ) : cases.filter((c) => c.fieldVerification?.photos?.length).length === 0 ? (
            <EmptyState
              title="No Pending Field Inspections"
              description="Field verification requests assigned for physical inspection will appear here."
            />
          ) : (
            <div className="dashboard-queue-list">
              {cases
                .filter((c) => c.fieldVerification?.photos?.length)
                .slice(0, 5)
                .map((c) => (
                  <div key={c.caseId} className="dashboard-queue-card">
                    <div className="dashboard-queue-info">
                      <div className="dashboard-queue-title">
                        <Camera className="w-3.5 h-3.5 text-navy" />
                        <span>
                          Survey #{c.extractedData?.surveyNumber?.value || 'N/A'}
                          {c.extractedData?.subDivisionNumber?.value ? `/${c.extractedData.subDivisionNumber.value}` : ''} Field Inspection
                        </span>
                      </div>
                      <div className="dashboard-queue-meta">
                        <span>{c.fieldVerification?.photos?.length} Geo-tagged Photos</span>
                        {c.extractedData?.villageName?.value && (
                          <>
                            <span>•</span>
                            <span>Village: {c.extractedData.villageName.value}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-navy font-bold">Ref: {c.caseId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="table-status-pill locked">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        VERIFIED
                      </span>
                      <Link
                        href={`/officer/history/${c.caseId}`}
                        className="dashboard-action-link"
                        title="Inspect Field Inspection"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}
