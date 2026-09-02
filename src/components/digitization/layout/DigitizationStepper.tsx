'use client';

import React from 'react';
import { DIGITIZATION_WORKFLOW_STEPS, WorkflowStepConfig } from '@/config/digitizationWorkflowState';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface DigitizationStepperProps {
  currentStepIndex: number; // 1 to 8
  onStepClick?: (stepIndex: number) => void;
}

export const DigitizationStepper: React.FC<DigitizationStepperProps> = ({
  currentStepIndex,
  onStepClick,
}) => {
  const totalSteps = DIGITIZATION_WORKFLOW_STEPS.length;
  const currentConfig = DIGITIZATION_WORKFLOW_STEPS[currentStepIndex - 1] || DIGITIZATION_WORKFLOW_STEPS[0];
  const completionPercentage = Math.round(((currentStepIndex - 1) / totalSteps) * 100);

  return (
    <div className="bg-white border border-slate-300 rounded-md p-4 shadow-sm mb-6">
      {/* Mobile Stepper View (<1024px) */}
      <div className="block lg:hidden space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-navy-900 uppercase">
            STEP {currentStepIndex} OF {totalSteps} • {currentConfig.shortTitle}
          </span>
          <span className="font-bold text-amber-700">{completionPercentage}% COMPLETE</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-navy-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(8, (currentStepIndex / totalSteps) * 100)}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper View (>=1024px) */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {DIGITIZATION_WORKFLOW_STEPS.map((step: WorkflowStepConfig, idx: number) => {
            const stepNum = (idx + 1).toString().padStart(2, '0');
            const isCompleted = currentStepIndex > step.index;
            const isCurrent = currentStepIndex === step.index;
            const isClickable = onStepClick && isCompleted;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}

                <div
                  onClick={() => isClickable && onStepClick(step.index)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all flex-shrink-0 ${
                    isCurrent
                      ? 'bg-navy-900 text-amber-300 shadow-sm font-bold ring-1 ring-navy-800'
                      : isCompleted
                      ? 'bg-green-50 text-green-900 border border-green-200 cursor-pointer hover:bg-green-100'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${
                      isCurrent
                        ? 'bg-amber-300 text-navy-950'
                        : isCompleted
                        ? 'bg-green-700 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                  </div>

                  <span className="text-xs tracking-tight whitespace-nowrap font-sans">
                    {step.shortTitle}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
