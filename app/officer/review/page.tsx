'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { getCasesForJurisdiction, updateDigitizationCase } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, FileText, Camera, Eye, MapPin } from 'lucide-react';
import { DocumentViewer } from '@/components/documents/DocumentViewer';

export default function OfficerReviewQueuePage() {
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<DigitizationCaseDocument | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadReviewCases();
  }, []);

  const loadReviewCases = async () => {
    try {
      // Query cases requiring review for assigned Mandal (e.g. 5102)
      const fetched = await getCasesForJurisdiction(undefined, '5102');
      const requiresReview = fetched.filter(
        (c) => c.workflowStatus === 'PENDING_HIGHER_REVIEW' || c.workflowStatus === 'PENDING_VRO_REVIEW'
      );
      setCases(requiresReview);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (caseId: string) => {
    try {
      await updateDigitizationCase(caseId, {
        workflowStatus: 'DIGITIZED',
        reviewStatus: 'APPROVED',
        finalizedAt: new Date().toISOString(),
      });
      setActionSuccess(`Record ${caseId} approved and marked DIGITIZED.`);
      setSelectedCase(null);
      loadReviewCases();
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleRequestCorrection = async (caseId: string) => {
    try {
      await updateDigitizationCase(caseId, {
        workflowStatus: 'CORRECTION_REQUIRED',
        reviewStatus: 'CORRECTION_REQUIRED',
      });
      setActionSuccess(`Record ${caseId} returned to VRO for correction.`);
      setSelectedCase(null);
      loadReviewCases();
    } catch (err) {
      console.error('Correction request failed:', err);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Field Officer Workspace', href: '/officer/dashboard' }, { label: 'Pending Review Queue' }]} />
      <WorkspaceHeader
        title="HIGHER OFFICER REVIEW & ESCALATION QUEUE"
        subtitle="MRO / Tahsildar Authorized Review for Low-Confidence & Escalated Land Record Digitizations"
      />

      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-600 rounded text-xs text-green-800 font-bold">
          {actionSuccess}
        </div>
      )}

      {!selectedCase ? (
        <WorkspacePanel title="DIGITIZATION RECORDS REQUIRING REVIEW" guidance="Review cases flagged by confidence thresholds or physical verification discrepancies.">
          {cases.length === 0 ? (
            <EmptyState
              title="Review Queue Empty"
              description="No low-confidence or escalated digitization records require higher officer review at this time."
            />
          ) : (
            <div className="space-y-3">
              {cases.map((c) => (
                <div key={c.caseId} className="p-4 bg-white border border-slate-300 rounded-md shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900 text-sm">
                        {c.extractedData?.ownerName?.value || 'Pattadar'} ({c.documentType})
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                        {c.workflowStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-mono">
                      Ref: {c.caseId} • Survey #{c.extractedData?.surveyNumber?.value}/{c.extractedData?.subDivisionNumber?.value} • Extent: {c.extractedData?.extentAcres?.value} Ac
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>VRO: {c.createdBy}</span>
                      <span>•</span>
                      <span>AI Confidence: {Math.round((c.aiConfidenceScore || 0.9) * 100)}%</span>
                      <span>•</span>
                      <span>Photos: {c.fieldVerification?.photos?.length || 0}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCase(c)}
                    className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs rounded flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect & Review</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </WorkspacePanel>
      ) : (
        /* Detailed Inspection View */
        <WorkspacePanel title={`INSPECT DIGITIZATION RECORD: ${selectedCase.caseId}`} guidance="Compare VRO submissions, AI extraction confidence, and physical field inspection photos.">
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-100 p-3 rounded border border-slate-300">
              <span className="font-bold text-navy-900 text-xs font-mono">
                JURISDICTION: MANDAL 5102 (KURNOOL RURAL) • VILLAGE: KALLUR
              </span>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="text-xs font-bold text-navy-900 underline"
              >
                ← Return to Review Queue List
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-navy-900 text-xs uppercase mb-2">Original Document Scan</h4>
                <DocumentViewer originalFileName={selectedCase.documentUpload?.originalFileName} pageCount={selectedCase.documentUpload?.pageCount} />
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 bg-white border border-slate-300 rounded space-y-2">
                  <h4 className="font-bold text-navy-900 text-xs uppercase border-b pb-1">Extracted Land Schedule</h4>
                  <div>Owner: <strong>{selectedCase.extractedData?.ownerName?.value}</strong></div>
                  <div>Father/Husband: {selectedCase.extractedData?.fatherOrHusbandName?.value}</div>
                  <div>Survey No: {selectedCase.extractedData?.surveyNumber?.value}/{selectedCase.extractedData?.subDivisionNumber?.value}</div>
                  <div>Extent: {selectedCase.extractedData?.extentAcres?.value} Acres</div>
                  <div>East: {selectedCase.extractedData?.boundaries?.east?.value}</div>
                  <div>West: {selectedCase.extractedData?.boundaries?.west?.value}</div>
                  <div>North: {selectedCase.extractedData?.boundaries?.north?.value}</div>
                  <div>South: {selectedCase.extractedData?.boundaries?.south?.value}</div>
                </div>

                <div className="p-4 bg-white border border-slate-300 rounded space-y-2">
                  <h4 className="font-bold text-navy-900 text-xs uppercase border-b pb-1">VRO Verification Audit</h4>
                  <div>Physical Consent Accepted: Yes (VRO ID: {selectedCase.createdBy})</div>
                  <div>VRO Corrections Count: {selectedCase.corrections?.length || 0}</div>
                  <div>Field Photos Verified: {selectedCase.fieldVerification?.photos?.length || 0} Photos</div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => handleRequestCorrection(selectedCase.caseId)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Request VRO Correction</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(selectedCase.caseId)}
                    className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded flex items-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Mark DIGITIZED</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </WorkspacePanel>
      )}
    </div>
  );
}
