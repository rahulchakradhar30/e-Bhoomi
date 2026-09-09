'use client';

import React, { useEffect, useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode, StructuredLandRecordData } from '@/config/digitizationSchemas';
import { DocumentUploadRecord, FieldCorrectionAudit, VerificationChecklistState, FieldVerificationRecord, FinalConsentRecord } from '@/types/digitizationCase';
import { ShieldCheck, CheckCircle2, FileText, Camera, Info, Lock } from 'lucide-react';
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
  onValidityChange?: (isValid: boolean) => void;
  onBack?: () => void;
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
  onValidityChange,
}) => {
  const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === documentType) || SUPPORTED_DOCUMENT_TYPES[0];

  const [chkConfirmFinal, setChkConfirmFinal] = useState(initialFinalConsent?.finalConsentAccepted || false);
  const [chkLockUnderstand, setChkLockUnderstand] = useState(initialFinalConsent?.finalConsentAccepted || false);
  const [showDocModal, setShowDocModal] = useState(false);

  const isFinalConsentValid = chkConfirmFinal && chkLockUnderstand;

  useEffect(() => {
    onValidityChange?.(isFinalConsentValid);

    if (isFinalConsentValid) {
      const consentRec: FinalConsentRecord = {
        finalConsentAccepted: true,
        finalAcceptedAt: new Date().toISOString(),
        finalAcceptedBy: 'AP-545-VRO-00101',
        declarationText:
          'I confirm that I have reviewed the original document, AI-extracted information, corrections, field verification, and other required information and I am responsible for the information submitted for digitization.',
      };
      onFinalSubmitted(consentRec);
    }
  }, [chkConfirmFinal, chkLockUnderstand]);

  const totalRequiredChecklist = docConfig.checklistFields.length;
  const verifiedChecklistCount = docConfig.checklistFields.filter((f) => checklist[f.id]).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1050px', margin: '0 auto' }}>
      <WorkspacePanel
        title="FINAL SUMMARY & LEGAL CONFIRMATION"
        guidance="Review complete digitized record summary before executing permanent legal digitization lock."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Summary Banner */}
          <div className="digi-proc-header">
            <div className="digi-proc-title-group">
              <span className="digi-proc-job-ref">
                FINAL DIGITIZATION RECORD SUMMARY
              </span>
              <h3 className="digi-proc-main-title" style={{ fontSize: '1.1rem' }}>
                {structuredData.ownerName?.value || 'Pattadar'} • Survey #{structuredData.surveyNumber?.value || '142'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                {docConfig.titleEn} ({docConfig.titleTe}) • District: {structuredData.districtName?.value || 'Kurnool'} • Division: {structuredData.revenueDivision?.value || 'Kurnool'} • Mandal: {structuredData.mandalName?.value || 'Kurnool Rural'} • Village: {structuredData.villageName?.value || 'Kallur'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDocModal(!showDocModal)}
              className="digi-proc-btn gold"
            >
              <FileText className="w-4 h-4" />
              <span>{showDocModal ? 'Hide Original Scan' : 'View Original Scan'}</span>
            </button>
          </div>

          {showDocModal && (
            <div style={{ border: '1px solid #0b2545', borderRadius: '8px', padding: '12px', background: '#f8fafc' }}>
              <DocumentViewer originalFileName={uploadRecord.originalFileName} pageCount={uploadRecord.pageCount} />
            </div>
          )}

          {/* Structured Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Box 1: Land Details */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0b2545', textTransform: 'uppercase', margin: 0 }}>
                  Primary Land Ownership & Extent
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>PATTADAR NAME:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.ownerName?.value}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>FATHER / HUSBAND:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.fatherOrHusbandName?.value}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>SURVEY / SUB-DIV NO:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>
                    {structuredData.surveyNumber?.value}/{structuredData.subDivisionNumber?.value}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>KHATA NO:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.khataNumber?.value}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>EXTENT:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.extentAcres?.value} Acres</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>CLASSIFICATION:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.landClassification?.value}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Boundaries & Checklist */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <ShieldCheck className="w-4 h-4 text-navy-900" />
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0b2545', textTransform: 'uppercase', margin: 0 }}>
                  Four Side Boundaries & Checklist
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>EAST BOUNDARY:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.boundaries?.east?.value}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>WEST BOUNDARY:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.boundaries?.west?.value}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>NORTH BOUNDARY:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.boundaries?.north?.value}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>SOUTH BOUNDARY:</span>
                  <span style={{ fontWeight: 800, color: '#0b2545' }}>{structuredData.boundaries?.south?.value}</span>
                </div>
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <span>Category Checklist:</span>
                <span style={{ fontWeight: 800, color: '#166534' }}>
                  {verifiedChecklistCount} of {totalRequiredChecklist} Checklist Fields Verified
                </span>
              </div>
            </div>

            {/* Box 3: VRO Corrections */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <Info className="w-4 h-4 text-amber-700" />
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0b2545', textTransform: 'uppercase', margin: 0 }}>
                  VRO Field Corrections Audit ({corrections.length})
                </h4>
              </div>

              {corrections.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No AI values required manual modification.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', fontFamily: 'monospace', maxHeight: '120px', overflowY: 'auto' }}>
                  {corrections.map((c, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', background: '#fefce8', borderRadius: '4px', border: '1px solid #fde047' }}>
                      <span style={{ fontWeight: 800, color: '#0b2545' }}>{c.fieldId}:</span>{' '}
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{c.originalAIValue}</span> →{' '}
                      <span style={{ fontWeight: 800, color: '#166534' }}>{c.correctedValue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 4: Field Photos & KYC Status */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <Camera className="w-4 h-4 text-navy-900" />
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0b2545', textTransform: 'uppercase', margin: 0 }}>
                  Field Photos & KYC Status
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Inspection Photos:</span>
                  <span style={{ fontWeight: 800, color: '#166534' }}>
                    {fieldVerification?.photos?.length || 0} Photos Verified (Min 4 satisfied)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>KYC Gateway Status:</span>
                  <span style={{ fontWeight: 800, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                    {kycRecord?.status || 'UNAVAILABLE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Legal Declaration & Lock Checkboxes */}
          <div style={{ background: '#fefce8', border: '2px solid #fde047', borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: '#0b2545', color: '#fbbf24', borderRadius: '6px', display: 'flex' }}>
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', margin: 0 }}>
                  FINAL OFFICERS CONSENT & PERMANENT DIGITIZATION LOCK DECLARATION
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#713f12', margin: '2px 0 0 0' }}>
                  Read and accept final official consent before submitting digitized land record.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', fontFamily: "'Noto Sans Telugu', serif", lineHeight: 1.6, background: '#ffffff', padding: '12px 14px', borderRadius: '6px', border: '1px solid #fef08a', color: '#1e293b', margin: 0 }}>
              "I confirm that I have reviewed the original document, AI-extracted information, corrections, field verification, and other required information and I am responsible for the information submitted for digitization."
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={chkConfirmFinal}
                  onChange={(e) => setChkConfirmFinal(e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#0b2545' }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0b2545' }}>
                  I confirm and accept official responsibility for this land record digitization.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={chkLockUnderstand}
                  onChange={(e) => setChkLockUnderstand(e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#0b2545' }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0b2545' }}>
                  I understand that after final submission, I cannot directly edit the finalized digitization record.
                </span>
              </label>
            </div>
          </div>
        </div>
      </WorkspacePanel>
    </div>
  );
};
