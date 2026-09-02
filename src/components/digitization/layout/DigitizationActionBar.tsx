'use client';

import React, { useState } from 'react';
import { DIGITIZATION_WORKFLOW_STEPS } from '@/config/digitizationWorkflowState';
import { ArrowLeft, ArrowRight, Save, Send, Check } from 'lucide-react';

interface DigitizationActionBarProps {
  currentStepIndex: number; // 1 to 8
  canGoBack: boolean;
  canProceed: boolean;
  isFinalStep: boolean;
  onPrevious: () => void;
  onProceed: () => void;
  onSaveDraft?: () => void;
}

export const DigitizationActionBar: React.FC<DigitizationActionBarProps> = ({
  currentStepIndex,
  canGoBack,
  canProceed,
  isFinalStep,
  onPrevious,
  onProceed,
  onSaveDraft,
}) => {
  const totalSteps = DIGITIZATION_WORKFLOW_STEPS.length;
  const currentConfig = DIGITIZATION_WORKFLOW_STEPS[currentStepIndex - 1] || DIGITIZATION_WORKFLOW_STEPS[0];
  const nextConfig = DIGITIZATION_WORKFLOW_STEPS[currentStepIndex];

  const [savedToast, setSavedToast] = useState(false);

  const handleDraftClick = () => {
    onSaveDraft?.();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="sticky bottom-0 z-40 bg-white border-t-2 border-navy-900 shadow-2xl py-3 px-4 mt-8 flex flex-wrap items-center justify-between gap-3">
      {/* Left: Step Info */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold text-navy-900 uppercase">
          STEP {currentStepIndex} OF {totalSteps} • {currentConfig.shortTitle}
        </span>
        {savedToast && (
          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[11px] font-bold rounded flex items-center gap-1 font-mono">
            <Check className="w-3 h-3" /> Draft Progress Saved
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {canGoBack && (
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-navy-900 border border-slate-300 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Phase</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDraftClick}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-navy-800" />
          <span>Save Draft</span>
        </button>

        {!isFinalStep ? (
          <button
            type="button"
            disabled={!canProceed}
            onClick={onProceed}
            className={`px-6 py-2 bg-navy-900 font-bold text-xs uppercase tracking-wider rounded shadow flex items-center gap-2 transition-all ${
              canProceed
                ? 'hover:bg-navy-800 text-amber-300 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <span>Proceed to {nextConfig?.shortTitle || 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canProceed}
            onClick={onProceed}
            className={`px-8 py-2 bg-navy-900 font-bold text-xs uppercase tracking-wider rounded shadow-lg flex items-center gap-2 transition-all ${
              canProceed
                ? 'hover:bg-navy-800 text-amber-300 ring-2 ring-amber-400 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>FINAL SUBMIT DIGITIZATION RECORD</span>
          </button>
        )}
      </div>
    </div>
  );
};
