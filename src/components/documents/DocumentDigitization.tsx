'use client';

import React, { useState } from 'react';
import { WorkflowStepper } from '../workspace/WorkflowStepper';
import { WorkspacePanel } from '../workspace/WorkspacePanel';
import { StickyActionBar } from '../workspace/StickyActionBar';
import { FileUp, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const DocumentDigitization: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('1');
  const [fileSelected, setFileSelected] = useState(false);

  const steps = [
    { id: '1', label: 'Document Selection & Upload' },
    { id: '2', label: 'Source Verification' },
    { id: '3', label: 'AI OCR & Data Extraction' },
    { id: '4', label: 'Officer Review & Validation' },
    { id: '5', label: 'Field Verification Setup' },
    { id: '6', label: 'Final Submission' }
  ];

  return (
    <div>
      <WorkflowStepper
        steps={steps}
        currentStepId={currentStep}
        onStepClick={(id) => setCurrentStep(id)}
      />

      {currentStep === '1' && (
        <WorkspacePanel
          title="STEP 1: SELECT PHYSICAL LAND RECORD DOCUMENT"
          guidance="Upload official physical land record documents (RoR 1B, Mutation Orders, Field Measurement Books (FMB), Pattadar Passbooks) for digitization."
        >
          <div className="table-empty-state" style={{ borderStyle: 'solid', backgroundColor: '#FFFFFF', padding: '2.5rem 1.5rem' }}>
            <FileUp className="w-12 h-12 text-navy margin-bottom-sm" />
            <div className="empty-inbox-title">Upload Physical Land Record Scan (PDF / TIFF / JPEG)</div>
            <div className="empty-inbox-desc margin-bottom-md">
              High-resolution scans (min 300 DPI) ensure accurate multi-lingual OCR extraction.
            </div>

            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={() => setFileSelected(true)}
            />
            <label htmlFor="file-upload" className="gov-nav-btn login-btn" style={{ cursor: 'pointer' }}>
              Select Local Document File
            </label>

            {fileSelected && (
              <div className="generated-id-display margin-top-md">
                <CheckCircle2 className="w-5 h-5 text-green" />
                <span className="generated-id-text text-green">Document scan attached and validated for processing.</span>
              </div>
            )}
          </div>
        </WorkspacePanel>
      )}

      {currentStep === '2' && (
        <WorkspacePanel
          title="STEP 2: SOURCE VERIFICATION & METADATA"
          guidance="Select administrative jurisdiction to anchor document provenance in Local Government Directory (LGD)."
        >
          <div className="admin-form-grid">
            <div className="form-field-group">
              <label className="form-label">Document Record Type</label>
              <select className="form-select">
                <option value="ROR_1B">Record of Rights (RoR / 1B)</option>
                <option value="MUTATION">Mutation Order / Proceeding</option>
                <option value="FMB">Field Measurement Book (FMB) Sketch</option>
                <option value="PASSBOOK">Pattadar Passbook</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Physical Volume / Register Reference</label>
              <input type="text" className="form-input" placeholder="e.g. Vol-XIV / Page-24" />
            </div>
          </div>
        </WorkspacePanel>
      )}

      {currentStep !== '1' && currentStep !== '2' && (
        <WorkspacePanel
          title={`STEP ${currentStep}: PIPELINE STAGE`}
          guidance="Next.js App Router Clean Architecture Workspace."
        >
          <div className="table-empty-state">
            <ShieldCheck className="w-10 h-10 empty-inbox-icon" />
            <div className="empty-inbox-title">Pipeline Stage Active</div>
            <div className="empty-inbox-desc">
              Connect backend OCR/AI engine endpoints during future integration phase.
            </div>
          </div>
        </WorkspacePanel>
      )}

      <StickyActionBar>
        <div>
          <span className="text-sm font-bold text-navy">
            DIGITIZATION PIPELINE • STEP {currentStep} OF {steps.length}
          </span>
        </div>
        <div className="flex-align-center gap-sm">
          {parseInt(currentStep) > 1 && (
            <button
              type="button"
              className="officer-header-btn"
              onClick={() => setCurrentStep((parseInt(currentStep) - 1).toString())}
            >
              Previous Step
            </button>
          )}
          {parseInt(currentStep) < steps.length && (
            <button
              type="button"
              className="gov-nav-btn login-btn"
              onClick={() => setCurrentStep((parseInt(currentStep) + 1).toString())}
            >
              <span>Proceed to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </StickyActionBar>
    </div>
  );
};
