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
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      <WorkspacePanel
        title="DIGITIZATION WORKFLOW SUCCESSFULLY COMPLETED"
        guidance="The land record has been processed, physically verified, and permanently committed to e-BHOOMI Firestore records."
      >
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-navy-900 text-amber-300 rounded font-mono font-bold text-xs uppercase tracking-wider">
              {caseDoc.workflowStatus}
            </span>
            <h3 className="text-xl font-bold text-navy-900">
              LAND RECORD DIGITIZATION RECORD LOCKED
            </h3>
            <p className="text-xs text-slate-600 font-mono">
              Reference ID: <span className="font-bold text-navy-900">{caseDoc.caseId}</span>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-xs font-mono text-left max-w-md mx-auto space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">DOCUMENT CATEGORY:</span>
              <span className="font-bold text-navy-900">{caseDoc.documentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PATTADAR NAME:</span>
              <span className="font-bold text-navy-900">{caseDoc.extractedData?.ownerName?.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SURVEY / SUB-DIV:</span>
              <span className="font-bold text-navy-900">
                {caseDoc.extractedData?.surveyNumber?.value}/{caseDoc.extractedData?.subDivisionNumber?.value}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">EXTENT:</span>
              <span className="font-bold text-navy-900">{caseDoc.extractedData?.extentAcres?.value} Acres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">FIELD PHOTOS:</span>
              <span className="font-bold text-green-700">
                {caseDoc.fieldVerification?.photos?.length || 0} Photos Verified
              </span>
            </div>
          </div>

          {isHigherReview ? (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded text-xs text-amber-900 text-left space-y-1">
              <p className="font-bold">Escalated for Tahsildar / MRO Review</p>
              <p className="text-[11px] text-amber-800">
                This record contains medium/low confidence fields and has been routed to the Tahsildar / MRO review queue for your assigned Mandal.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded text-xs text-green-900 text-left space-y-1">
              <p className="font-bold">Digitized Record Finalized</p>
              <p className="text-[11px] text-green-800">
                The digitized land record has satisfied all confidence & verification policies and is now accessible via officer land registries.
              </p>
            </div>
          )}

          <div className="pt-6 border-t flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onReset}
              className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md shadow flex items-center gap-2"
            >
              <span>Digitize Another Record</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/officer/dashboard"
              className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-navy-900 font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-2"
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
