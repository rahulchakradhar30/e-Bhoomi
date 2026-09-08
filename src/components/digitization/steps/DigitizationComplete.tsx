'use client';

import React from 'react';
import Link from 'next/link';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { CheckCircle2, ShieldCheck, FileText, ArrowRight, Home } from 'lucide-react';
import { DigitizationCaseDocument } from '@/types/digitizationCase';

interface DigitizationCompleteProps {
  caseDoc: DigitizationCaseDocument;
  onReset: () => void;
}

export const DigitizationComplete: React.FC<DigitizationCompleteProps> = ({ caseDoc, onReset }) => {
  const isHigherReview = caseDoc.workflowStatus === 'PENDING_HIGHER_REVIEW';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', padding: '16px 0' }}>
      <WorkspacePanel
        title="DIGITIZATION WORKFLOW SUCCESSFULLY COMPLETED"
        guidance="The land record has been processed, physically verified, and permanently committed to e-BHOOMI Firestore records."
      >
        <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(22, 101, 52, 0.15)' }}>
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ background: '#0b2545', color: '#fbbf24', padding: '4px 12px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', alignSelf: 'center' }}>
              {caseDoc.workflowStatus}
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b2545', margin: '4px 0 0 0' }}>
              LAND RECORD DIGITIZATION RECORD LOCKED
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace', margin: 0 }}>
              Reference ID: <span style={{ fontWeight: 800, color: '#0b2545' }}>{caseDoc.caseId}</span>
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'monospace', textAlign: 'left', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>DOCUMENT CATEGORY:</span>
              <span style={{ fontWeight: 800, color: '#0b2545' }}>{caseDoc.documentType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>PATTADAR NAME:</span>
              <span style={{ fontWeight: 800, color: '#0b2545' }}>{caseDoc.extractedData?.ownerName?.value}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>SURVEY / SUB-DIV:</span>
              <span style={{ fontWeight: 800, color: '#0b2545' }}>
                {caseDoc.extractedData?.surveyNumber?.value}/{caseDoc.extractedData?.subDivisionNumber?.value}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>EXTENT:</span>
              <span style={{ fontWeight: 800, color: '#0b2545' }}>{caseDoc.extractedData?.extentAcres?.value} Acres</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>FIELD PHOTOS:</span>
              <span style={{ fontWeight: 800, color: '#166534' }}>
                {caseDoc.fieldVerification?.photos?.length || 0} Photos Verified
              </span>
            </div>
          </div>

          {isHigherReview ? (
            <div style={{ padding: '14px 18px', background: '#fefce8', borderLeft: '4px solid #d97706', borderRadius: '6px', fontSize: '0.78rem', color: '#854d0e', textAlign: 'left', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontWeight: 800, margin: 0 }}>Escalated for Tahsildar / MRO Review</p>
              <p style={{ fontSize: '0.72rem', color: '#713f12', margin: 0 }}>
                This record contains medium/low confidence fields and has been routed to the Tahsildar / MRO review queue for your assigned Mandal.
              </p>
            </div>
          ) : (
            <div style={{ padding: '14px 18px', background: '#f0fdf4', borderLeft: '4px solid #16a34a', borderRadius: '6px', fontSize: '0.78rem', color: '#14532d', textAlign: 'left', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontWeight: 800, margin: 0 }}>Digitized Record Finalized</p>
              <p style={{ fontSize: '0.72rem', color: '#166534', margin: 0 }}>
                The digitized land record has satisfied all confidence & verification policies and is now accessible via officer land registries.
              </p>
            </div>
          )}

          <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px', width: '100%' }}>
            <button
              type="button"
              onClick={onReset}
              className="digi-btn-proceed"
            >
              <span>Digitize Another Record</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/officer/dashboard"
              className="digi-btn-prev"
              style={{ textDecoration: 'none' }}
            >
              <Home className="w-4 h-4" />
              <span>Return to VRO Dashboard</span>
            </Link>
          </div>
        </div>
      </WorkspacePanel>
    </div>
  );
};
