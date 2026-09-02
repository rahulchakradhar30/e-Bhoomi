'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { FileUp, ShieldCheck, FileText, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { getAssignedCasesForOfficer } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';
import { useCurrentUser } from '@/context/AuthContext';

export default function OfficerDashboardPage() {
  const { officerProfile } = useCurrentUser();
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const officerId = officerProfile?.officerId || 'AP-545-VRO-00101';
        const fetched = await getAssignedCasesForOfficer(officerId);
        setCases(fetched);
      } catch (err) {
        console.error('Failed to load dashboard cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [officerProfile]);

  const totalSubmitted = cases.length;
  const aiProcessed = cases.filter((c) => c.workflowStatus !== 'DRAFT').length;
  const pendingReview = cases.filter((c) => c.workflowStatus === 'PENDING_HIGHER_REVIEW' || c.workflowStatus === 'PENDING_VRO_REVIEW').length;
  const fieldVerificationCount = cases.filter((c) => c.fieldVerification?.photos?.length).length;
  const approvedCount = cases.filter((c) => c.workflowStatus === 'DIGITIZED').length;

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
        <WorkspacePanel title="DIGITIZATION PIPELINE QUEUE" guidance="Recent document uploads and AI extraction processing status.">
          {cases.length === 0 ? (
            <EmptyState
              title="Digitization Queue Empty"
              description="Upload physical land records to initiate AI multi-lingual OCR extraction and verification."
            />
          ) : (
            <div className="space-y-3">
              {cases.slice(0, 5).map((c) => (
                <div key={c.caseId} className="p-3 bg-white border border-slate-200 rounded-md text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-navy-900">{c.extractedData?.ownerName?.value || 'Pattadar'} ({c.documentType})</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Ref: {c.caseId} • Survey #{c.extractedData?.surveyNumber?.value || '142'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-navy-100 text-navy-800">
                    {c.workflowStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel title="FIELD VERIFICATION TASKS" guidance="Assigned field inspection and boundary verification tasks.">
          {cases.filter((c) => c.fieldVerification?.photos?.length).length === 0 ? (
            <EmptyState
              title="No Pending Field Inspections"
              description="Field verification requests assigned by Tahsildar/MRO will appear here."
            />
          ) : (
            <div className="space-y-3">
              {cases
                .filter((c) => c.fieldVerification?.photos?.length)
                .slice(0, 5)
                .map((c) => (
                  <div key={c.caseId} className="p-3 bg-white border border-slate-200 rounded-md text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-navy-900">Survey #{c.extractedData?.surveyNumber?.value} Inspection</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {c.fieldVerification?.photos?.length} photos verified
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-green-100 text-green-800">
                      VERIFIED
                    </span>
                  </div>
                ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}
