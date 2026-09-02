'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { KYCStatus } from '@/lib/digitization/kycProvider';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface KYCStepProps {
  initialStatus?: { status: KYCStatus; providerName: string; message: string };
  onKYCCompleted: (kycRecord: { status: KYCStatus; providerName: string; message: string }) => void;
  onBack: () => void;
}

export const KYCStep: React.FC<KYCStepProps> = ({
  initialStatus,
  onKYCCompleted,
  onBack,
}) => {
  const [kycRecord] = useState(
    initialStatus || {
      status: 'UNAVAILABLE' as KYCStatus,
      providerName: 'State e-Gov Security KYC Gateway',
      message: 'KYC integration requires authorized UIDAI service connection. Continuing workflow with VRO physical verification.',
    }
  );

  const handleProceed = () => {
    onKYCCompleted(kycRecord);
  };

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="PHASE 10: LAND OWNER CITIZEN KYC INTEGRATION STATUS"
        guidance="Integration-ready module for Aadhaar/Citizen identity verification against digitized land records."
      >
        <div className="space-y-6 py-4">
          <div className="bg-amber-50/70 border border-amber-300 p-5 rounded-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-navy-900 text-amber-300 rounded-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-navy-900 text-sm uppercase">
                  GOVERNMENT E-KYC GATEWAY MODULE
                </h4>
                <p className="text-xs text-slate-600">
                  Provider: {kycRecord.providerName}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">STATUS:</span>
                <span className="px-2.5 py-1 rounded font-bold font-mono text-amber-800 bg-amber-100 border border-amber-300">
                  {kycRecord.status}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 border-t border-slate-100">
                {kycRecord.message}
              </p>
            </div>

            <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Security Governance Policy</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-normal">
                e-BHOOMI does not simulate fake OTP verification. Authorized UIDAI identity validation will execute automatically once official state gateway tokens are active. The VRO physical verification remains legally binding for this workflow.
              </p>
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
            ← Back to Field Verification
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md shadow flex items-center gap-2"
          >
            <span>Proceed to Final Summary & Consent</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </WorkspacePanel>
    </div>
  );
};
