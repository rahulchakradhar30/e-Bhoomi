'use client';

import React from 'react';
import { DigitizationActionBar } from './DigitizationActionBar';
import { DIGITIZATION_WORKFLOW_STEPS } from '@/config/digitizationWorkflowState';
import { Check } from 'lucide-react';

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
  const currentConfig = DIGITIZATION_WORKFLOW_STEPS[currentStepIndex - 1] || DIGITIZATION_WORKFLOW_STEPS[0];

  return (
    <div className="digi-workspace-wrapper">
      {/* Visual 8-Step Interactive Progress Stepper */}
      <div className="digi-stepper-container">
        {DIGITIZATION_WORKFLOW_STEPS.map((step, idx) => {
          const isActive = step.index === currentStepIndex;
          const isCompleted = step.index < currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`digi-step-node ${isActive ? 'is-active' : ''} ${
                  isCompleted ? 'is-completed' : ''
                }`}
              >
                <div className="digi-step-bubble">
                  {isCompleted ? <Check style={{ width: 14, height: 14 }} /> : step.index}
                </div>
                <div className="digi-step-text">
                  <span className="digi-step-sublabel">Step 0{step.index}</span>
                  <span className="digi-step-mainlabel">{step.shortTitle}</span>
                </div>
              </div>
              {idx < totalSteps - 1 && (
                <div className={`digi-step-divider ${isCompleted ? 'is-completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Guidance Strip */}
      <div style={{
        background: '#ffffff',
        borderLeft: '4px solid #0b2545',
        border: '1px solid #cbd5e1',
        borderLeftWidth: '4px',
        borderRadius: '6px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: '#334155'
      }}>
        <div>
          <strong style={{ color: '#0b2545', textTransform: 'uppercase', marginRight: '8px' }}>
            {currentConfig.title}
          </strong>
          <span>{currentConfig.guidance}</span>
        </div>
        <span style={{
          fontFamily: 'monospace',
          fontWeight: 700,
          background: '#f1f5f9',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.72rem',
          color: '#0b2545'
        }}>
          PHASE {currentStepIndex}/{totalSteps}
        </span>
      </div>

      {/* Main Step Content */}
      <div style={{ minHeight: '480px' }}>{children}</div>

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

