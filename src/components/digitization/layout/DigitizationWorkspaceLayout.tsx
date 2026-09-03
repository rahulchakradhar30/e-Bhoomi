'use client';

import React from 'react';
import { DigitizationActionBar } from './DigitizationActionBar';
import { DIGITIZATION_WORKFLOW_STEPS } from '@/config/digitizationWorkflowState';

interface DigitizationWorkspaceLayoutProps {
  currentStepIndex: number; // 1 to 8
  canGoBack: boolean;
  canProceed: boolean;
  onPrevious: () => void;
  onProceed: () => void;
  onSaveDraft?: () => void;
  children: React.ReactNode;
}

export const DigitizationWorkspaceLayout: React.FC<DigitizationWorkspaceLayoutProps> = ({
  currentStepIndex,
  canGoBack,
  canProceed,
  onPrevious,
  onProceed,
  onSaveDraft,
  children,
}) => {
  const totalSteps = DIGITIZATION_WORKFLOW_STEPS.length;
  const isFinalStep = currentStepIndex === totalSteps;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      {/* Main Step Content */}
      <div className="min-h-[400px]">{children}</div>

      {/* Sticky Bottom Action Bar */}
      <DigitizationActionBar
        currentStepIndex={currentStepIndex}
        canGoBack={canGoBack}
        canProceed={canProceed}
        isFinalStep={isFinalStep}
        onPrevious={onPrevious}
        onProceed={onProceed}
        onSaveDraft={onSaveDraft}
      />
    </div>
  );
};
