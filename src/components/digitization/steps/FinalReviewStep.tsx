'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode, StructuredLandRecordData } from '@/config/digitizationSchemas';
import { DocumentUploadRecord, FieldCorrectionAudit, VerificationChecklistState, FieldVerificationRecord, FinalConsentRecord } from '@/types/digitizationCase';
import { ShieldCheck, CheckCircle2, FileText, Camera, Info, Lock, AlertTriangle, Send } from 'lucide-react';
import { DocumentViewer } from '@/components/documents/DocumentViewer';

interface FinalReviewStepProps {
  documentType: DocumentCategoryCode;
  uploadRecord: DocumentUploadRecord;
  structuredData: StructuredLandRecordData;
  corrections: FieldCorrectionAudit[];
  checklist: VerificationChecklistState;
  fieldVerification: FieldVerificationRecord;
  kycRecord: { status: string; providerName: string; message: string };
  initialFinalConsent?: FinalConsentRecord;
  onFinalSubmitted: (finalConsent: FinalConsentRecord) => void;
  onBack: () => void;
}

export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  documentType,
  uploadRecord,
  structuredData,
  corrections,
  checklist,
  fieldVerification,
  kycRecord,
  initialFinalConsent,
  onFinalSubmitted,
  onBack,
}) => {
  const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === documentType) || SUPPORTED_DOCUMENT_TYPES[0];

  const [chkConfirmFinal, setChkConfirmFinal] = useState(initialFinalConsent?.finalConsentAccepted || false);
  const [chkLockUnderstand, setChkLockUnderstand] = useState(initialFinalConsent?.finalConsentAccepted || false);
  const [showDocModal, setShowDocModal] = useState(false);

  const isFinalConsentValid = chkConfirmFinal && chkLockUnderstand;

  const handleFinalSubmit = () => {
    if (!isFinalConsentValid) return;

    const consentRec: FinalConsentRecord = {
      finalConsentAccepted: true,
      finalAcceptedAt: new Date().toISOString(),
      finalAcceptedBy: 'AP-545-VRO-00101',
      declarationText:
        'I confirm that I have reviewed the original document, AI-extracted information, corrections, field verification, and other required information and I am responsible for the information submitted for digitization.',
    };

    onFinalSubmitted(consentRec);
  };

  const totalRequiredChecklist = docConfig.checklistFields.length;
  const verifiedChecklistCount = docConfig.checklistFields.filter((f) => checklist[f.id]).length;

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="PHASE 11 & 12: FINAL REVIEW, OFFICERS FINAL CONSENT & RECORD SUBMISSION"
        guidance="Final Verification: Review complete digitized record summary before executing legal digitization lock."
      >
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="bg-navy-900 text-white p-5 rounded-md shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                FINAL DIGITIZATION RECORD SUMMARY
              </span>
              <h3 className="text-xl font-bold">
                {structuredData.ownerName?.value || 'Pattadar'} • Survey #{structuredData.surveyNumber?.value || '142'}
              </h3>
              <p className="text-xs text-slate-300">
                {docConfig.titleEn} ({docConfig.titleTe}) • Village: {structuredData.villageName?.value || 'Kallur'}, Mandal: {structuredData.mandalName?.value || 'Kurnool Rural'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDocModal(!showDocModal)}
              className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-amber-300 text-xs font-bold rounded border border-navy-600 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{showDocModal ? 'Hide Original Document' : 'View Original Document'}</span>
            </button>
          </div>

          {showDocModal && (
            <div className="border border-navy-800 rounded-md p-2 bg-slate-100">
              <DocumentViewer originalFileName={uploadRecord.originalFileName} pageCount={uploadRecord.pageCount} />
            </div>
          )}

          {/* Structured Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Land Details */}
            <div className="bg-white p-4 rounded-md border border-slate-300 space-y-3">
              <h4 className="font-bold text-navy-900 text-xs uppercase border-b pb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <span>Primary Land Ownership & Extent</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">PATTADAR NAME:</span>
                  <span className="font-bold text-navy-900">{structuredData.ownerName?.value}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">FATHER / HUSBAND:</span>
                  <span className="font-bold text-navy-900">{structuredData.fatherOrHusbandName?.value}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SURVEY / SUB-DIV NO:</span>
                  <span className="font-bold text-navy-900">
                    {structuredData.surveyNumber?.value}/{structuredData.subDivisionNumber?.value}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">KHATA NO:</span>
                  <span className="font-bold text-navy-900">{structuredData.khataNumber?.value}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">EXTENT:</span>
                  <span className="font-bold text-navy-900">{structuredData.extentAcres?.value} Acres</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CLASSIFICATION:</span>
                  <span className="font-bold text-navy-900">{structuredData.landClassification?.value}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Boundaries & Checklist */}
            <div className="bg-white p-4 rounded-md border border-slate-300 space-y-3">
              <h4 className="font-bold text-navy-900 text-xs uppercase border-b pb-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-navy-800" />
                <span>Four Side Boundaries & Verification</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">EAST BOUNDARY:</span>
                  <span className="font-bold text-navy-900">{structuredData.boundaries?.east?.value}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">WEST BOUNDARY:</span>
                  <span className="font-bold text-navy-900">{structuredData.boundaries?.west?.value}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NORTH BOUNDARY:</span>
                  <span className="font-bold text-navy-900">{structuredData.boundaries?.north?.value}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SOUTH BOUNDARY:</span>
                  <span className="font-bold text-navy-900">{structuredData.boundaries?.south?.value}</span>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs font-mono">
                <span>Category Checklist:</span>
                <span className="font-bold text-green-700">
                  {verifiedChecklistCount} of {totalRequiredChecklist} Checklist Fields Verified
                </span>
              </div>
            </div>

            {/* Box 3: VRO Corrections */}
            <div className="bg-white p-4 rounded-md border border-slate-300 space-y-2">
              <h4 className="font-bold text-navy-900 text-xs uppercase border-b pb-1.5 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700" />
                <span>VRO Field Corrections Audit ({corrections.length})</span>
              </h4>

              {corrections.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No AI values required manual modification.</p>
              ) : (
                <div className="space-y-1.5 text-xs font-mono max-h-32 overflow-auto">
                  {corrections.map((c, idx) => (
                    <div key={idx} className="p-1.5 bg-amber-50 rounded border border-amber-200">
                      <span className="font-bold text-navy-900">{c.fieldId}:</span>{' '}
                      <span className="line-through text-slate-400">{c.originalAIValue}</span> →{' '}
                      <span className="font-bold text-green-800">{c.correctedValue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 4: Field Photos & KYC Status */}
            <div className="bg-white p-4 rounded-md border border-slate-300 space-y-2">
              <h4 className="font-bold text-navy-900 text-xs uppercase border-b pb-1.5 flex items-center gap-2">
                <Camera className="w-4 h-4 text-navy-800" />
                <span>Field Photos & KYC Status</span>
              </h4>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Inspection Photos:</span>
                  <span className="font-bold text-green-700">
                    {fieldVerification?.photos?.length || 0} Photos Attached (Min 4 verified)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">KYC Status:</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                    {kycRecord?.status || 'UNAVAILABLE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Consent & Lock Declaration */}
          <div className="p-5 bg-amber-50/90 border-2 border-amber-400 rounded-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-navy-900 text-amber-300 rounded-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-navy-900 text-sm uppercase">
                  FINAL OFFICERS CONSENT & PERMANENT DIGITIZATION LOCK DECLARATION
                </h4>
                <p className="text-xs text-slate-700">
                  Read and accept final official consent before submitting digitized land record.
                </p>
              </div>
            </div>

            <p className="text-xs text-navy-950 font-serif leading-relaxed bg-white p-3.5 rounded border border-amber-300">
              "I confirm that I have reviewed the original document, AI-extracted information, corrections, field verification, and other required information and I am responsible for the information submitted for digitization."
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-white rounded border border-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkConfirmFinal}
                  onChange={(e) => setChkConfirmFinal(e.target.checked)}
                  className="mt-1 w-4 h-4 text-navy-800 rounded border-slate-400 focus:ring-navy-800"
                />
                <span className="text-xs font-bold text-navy-900">
                  [✓] I confirm and accept official responsibility for this land record digitization.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded border border-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkLockUnderstand}
                  onChange={(e) => setChkLockUnderstand(e.target.checked)}
                  className="mt-1 w-4 h-4 text-navy-800 rounded border-slate-400 focus:ring-navy-800"
                />
                <span className="text-xs font-bold text-navy-900">
                  [✓] I understand that after final submission, I cannot directly edit the finalized digitization record.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-navy-900 border border-slate-300 rounded hover:bg-slate-100"
          >
            ← Back to KYC Status
          </button>

          <button
            type="button"
            disabled={!isFinalConsentValid}
            onClick={handleFinalSubmit}
            className={`px-8 py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isFinalConsentValid
                ? 'bg-navy-900 hover:bg-navy-800 text-amber-300 shadow-lg cursor-pointer ring-2 ring-amber-400'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>FINAL SUBMIT DIGITIZATION RECORD</span>
          </button>
        </div>
      </WorkspacePanel>
    </div>
  );
};
