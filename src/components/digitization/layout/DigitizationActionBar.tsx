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
    <div className="digi-action-bar">
      {/* Left: Step Info */}
      <div className="digi-action-info">
        <span className="digi-action-step-text">
          STEP {currentStepIndex} OF {totalSteps} • {currentConfig.shortTitle}
        </span>
        {savedToast && (
          <span style={{
            padding: '2px 8px',
            background: '#dcfce7',
            color: '#166534',
            fontSize: '0.72rem',
            fontWeight: 700,
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'monospace'
          }}>
            <Check style={{ width: 12, height: 12 }} /> Draft Saved
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="digi-action-btn-group">
        {canGoBack && (
          <button
            type="button"
            onClick={onPrevious}
            className="digi-btn-prev"
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Previous Phase</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDraftClick}
          className="digi-btn-draft"
        >
          <Save style={{ width: 14, height: 14 }} />
          <span>Save Draft</span>
        </button>

        {!isFinalStep ? (
          <button
            type="button"
            disabled={!canProceed}
            onClick={onProceed}
            className="digi-btn-proceed"
          >
            <span>Proceed to {nextConfig?.shortTitle || 'Next Step'}</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canProceed}
            onClick={onProceed}
            className="digi-btn-proceed"
            style={{ background: '#0f6b3d', borderColor: '#059669', color: '#ffffff' }}
          >
            <Send style={{ width: 16, height: 16 }} />
            <span>FINAL SUBMIT DIGITIZATION RECORD</span>
          </button>
        )}
      </div>
    </div>
  );
};

