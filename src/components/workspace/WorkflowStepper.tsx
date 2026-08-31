'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  label: string;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  currentStepId,
  onStepClick
}) => {
  return (
    <div className="workspace-panel workflow-bar-panel margin-bottom-md">
      <div className="workflow-title">DIGITIZATION & VERIFICATION PIPELINE PROGRESS</div>
      <div className="workflow-sequence">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStepId;
          return (
            <React.Fragment key={step.id}>
              {idx > 0 && <ChevronRight className="w-4 h-4 step-arrow flex-shrink-0" />}
              <div
                className={`step-tag ${isActive ? 'active' : ''}`}
                onClick={() => onStepClick && onStepClick(step.id)}
                style={{ cursor: onStepClick ? 'pointer' : 'default' }}
              >
                <span>{idx + 1}. {step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
