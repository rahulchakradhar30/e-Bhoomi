'use client';

import React from 'react';
import { FileText, ShieldCheck, MapPin, User, Clock } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

interface DigitizationHeaderProps {
  caseId: string;
  workflowStatus: string;
  originalFileName?: string;
  officerId?: string;
}

export const DigitizationHeader: React.FC<DigitizationHeaderProps> = ({
  caseId,
  workflowStatus,
  originalFileName,
  officerId = 'AP-545-VRO-00101',
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DIGITIZED':
        return <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-green-100 text-green-800 border border-green-300">DIGITIZED (LOCKED)</span>;
      case 'PENDING_HIGHER_REVIEW':
        return <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">PENDING TAHSILDAR REVIEW</span>;
      case 'PROCESSING':
      case 'OCR_PROCESSING':
        return <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-blue-100 text-blue-900 border border-blue-300">PROCESSING PIPELINE</span>;
      default:
        return <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-navy-100 text-navy-900 border border-navy-300">DRAFT IN PROGRESS</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-300 rounded-md p-4 shadow-sm mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-navy-900" />
            <h2 className="font-extrabold text-navy-900 text-base uppercase tracking-wide">
              GOVERNMENT OF ANDHRA PRADESH • LAND RECORD DIGITIZATION WORKSPACE
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            SIH26018 — Assistive Multi-Lingual Land Record Digitization & Legal Verification System
          </p>
        </div>

        <div>{getStatusBadge(workflowStatus)}</div>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
          <Clock className="w-4 h-4 text-navy-700 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block">DIGITIZATION CASE ID:</span>
            <span className="font-bold text-navy-900 truncate block">{caseId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
          <FileText className="w-4 h-4 text-navy-700 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block">DOCUMENT SCAN:</span>
            <span className="font-bold text-navy-900 truncate block" title={originalFileName || 'Not attached'}>
              {originalFileName || 'Pending Upload'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
          <User className="w-4 h-4 text-navy-700 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block">AUTHORIZED OFFICER:</span>
            <span className="font-bold text-navy-900 truncate block">{officerId} (VRO)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
          <MapPin className="w-4 h-4 text-navy-700 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block">JURISDICTION:</span>
            <span className="font-bold text-navy-900 truncate block">
              {APP_CONFIG.activeDistrict} • Kurnool Rural
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
