'use client';

import React from 'react';
import { DigitizationHeader } from './DigitizationHeader';
import { DigitizationStepper } from './DigitizationStepper';
import { DigitizationActionBar } from './DigitizationActionBar';
import { DIGITIZATION_WORKFLOW_STEPS } from '@/config/digitizationWorkflowState';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface DigitizationWorkspaceLayoutProps {
  currentStepIndex: number; // 1 to 8
  caseId: string;
  workflowStatus: string;
  originalFileName?: string;
  officerId?: string;
  canGoBack: boolean;
  canProceed: boolean;
  onPrevious: () => void;
  onProceed: () => void;
  onSaveDraft?: () => void;
  onStepClick?: (stepIndex: number) => void;
  children: React.ReactNode;
}

export const DigitizationWorkspaceLayout: React.FC<DigitizationWorkspaceLayoutProps> = ({
  currentStepIndex,
  caseId,
  workflowStatus,
  originalFileName,
  officerId,
  canGoBack,
  canProceed,
  onPrevious,
  onProceed,
  onSaveDraft,
  onStepClick,
  children,
}) => {
  const totalSteps = DIGITIZATION_WORKFLOW_STEPS.length;
  const currentConfig = DIGITIZATION_WORKFLOW_STEPS[currentStepIndex - 1] || DIGITIZATION_WORKFLOW_STEPS[0];
  const isFinalStep = currentStepIndex === totalSteps;

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4 py-2">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Field Officer Workspace', href: '/officer/dashboard' },
          { label: 'Land Digitization', href: '/officer/digitization/new' },
          { label: `Step ${currentStepIndex} of ${totalSteps}` },
        ]}
      />

      {/* Header */}
      <DigitizationHeader
        caseId={caseId}
        workflowStatus={workflowStatus}
        originalFileName={originalFileName}
        officerId={officerId}
      />

      {/* Stepper */}
      <DigitizationStepper
        currentStepIndex={currentStepIndex}
        onStepClick={onStepClick}
      />

      {/* Title & Guidance Banner */}
      <div className="bg-white border border-slate-300 border-l-4 border-l-navy-900 rounded-md p-4 shadow-sm">
        <div className="font-mono text-xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">
          STEP {currentStepIndex} OF {totalSteps}
        </div>
        <h3 className="font-extrabold text-navy-900 text-lg uppercase tracking-wide">
          {currentConfig.title}
        </h3>
        <p className="text-xs text-slate-600 mt-1 font-sans">
          {currentConfig.guidance}
        </p>
      </div>

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
