'use client';

import React, { useEffect, useState } from 'react';
import { WorkflowStepper } from '../workspace/WorkflowStepper';
import { StickyActionBar } from '../workspace/StickyActionBar';
import { VROConsentStep } from '../digitization/steps/VROConsentStep';
import { DocumentTypeStep } from '../digitization/steps/DocumentTypeStep';
import { UploadStep } from '../digitization/steps/UploadStep';
import { ProcessingStep } from '../digitization/steps/ProcessingStep';
import { ExtractionReviewStep } from '../digitization/steps/ExtractionReviewStep';
import { FieldVerificationStep } from '../digitization/steps/FieldVerificationStep';
import { KYCStep } from '../digitization/steps/KYCStep';
import { FinalReviewStep } from '../digitization/steps/FinalReviewStep';
import { DigitizationComplete } from '../digitization/steps/DigitizationComplete';

import { DocumentCategoryCode, StructuredLandRecordData } from '@/config/digitizationSchemas';
import {
  DigitizationCaseDocument,
  VROConsentRecord,
  DocumentUploadRecord,
  FieldCorrectionAudit,
  VerificationChecklistState,
  FieldVerificationRecord,
  FinalConsentRecord,
  DigitizationWorkflowStatus,
} from '@/types/digitizationCase';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult } from '@/lib/digitization/aiExtractionProvider';
import { createDigitizationCase, getActiveDraftForOfficer } from '@/lib/services/digitizationService';
import { ArrowRight, Save, RotateCcw } from 'lucide-react';

export const DocumentDigitization: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [caseId] = useState(() => `CASE-DIG-${Date.now()}`);

  // Workflow states
  const [initialConsent, setInitialConsent] = useState<VROConsentRecord | undefined>();
  const [documentType, setDocumentType] = useState<DocumentCategoryCode>('ADANGAL');
  const [uploadRecord, setUploadRecord] = useState<DocumentUploadRecord | undefined>();
  const [ocrResult, setOcrResult] = useState<OCRResult | undefined>();
  const [aiResult, setAiResult] = useState<AIExtractionResult | undefined>();
  const [structuredData, setStructuredData] = useState<StructuredLandRecordData | undefined>();
  const [corrections, setCorrections] = useState<FieldCorrectionAudit[]>([]);
  const [checklist, setChecklist] = useState<VerificationChecklistState>({});
  const [fieldVerification, setFieldVerification] = useState<FieldVerificationRecord | undefined>();
  const [kycRecord, setKycRecord] = useState<{ status: any; providerName: string; message: string }>({
    status: 'UNAVAILABLE',
    providerName: 'State e-Gov Security KYC Gateway',
    message: 'KYC integration requires authorized UIDAI service connection.',
  });
  const [finalConsent, setFinalConsent] = useState<FinalConsentRecord | undefined>();
  const [completedCaseDoc, setCompletedCaseDoc] = useState<DigitizationCaseDocument | undefined>();

  const steps = [
    { id: '1', label: '1. VRO Consent' },
    { id: '2', label: '2. Document Type' },
    { id: '3', label: '3. Document Upload' },
    { id: '4', label: '4. Processing & OCR' },
    { id: '5', label: '5. AI Extraction Review' },
    { id: '6', label: '6. Field Verification' },
    { id: '7', label: '7. KYC Integration' },
    { id: '8', label: '8. Final Review & Consent' },
  ];

  // Try resuming draft on mount
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const draft = await getActiveDraftForOfficer('AP-545-VRO-00101');
        if (draft) {
          if (draft.initialConsent) setInitialConsent(draft.initialConsent);
          if (draft.documentType) setDocumentType(draft.documentType);
          if (draft.documentUpload) setUploadRecord(draft.documentUpload);
          if (draft.ocrResult) setOcrResult(draft.ocrResult);
          if (draft.extractedData) setStructuredData(draft.extractedData);
          if (draft.corrections) setCorrections(draft.corrections);
          if (draft.checklist) setChecklist(draft.checklist);
          if (draft.fieldVerification) setFieldVerification(draft.fieldVerification);
        }
      } catch (err) {
        console.error('Error checking active draft:', err);
      }
    };
    checkDraft();
  }, []);

  // Handlers for step completion
  const handleConsentAccepted = (record: VROConsentRecord) => {
    setInitialConsent(record);
    setCurrentStepIndex(2);
  };

  const handleTypeSelected = (docType: DocumentCategoryCode) => {
    setDocumentType(docType);
    setCurrentStepIndex(3);
  };

  const handleUploadCompleted = (record: DocumentUploadRecord) => {
    setUploadRecord(record);
    setCurrentStepIndex(4);
  };

  const handleProcessingCompleted = (ocrRes: OCRResult, aiRes: AIExtractionResult) => {
    setOcrResult(ocrRes);
    setAiResult(aiRes);
    setStructuredData(aiRes.structuredData);
    setCurrentStepIndex(5);
  };

  const handleReviewCompleted = (
    updatedData: StructuredLandRecordData,
    corrs: FieldCorrectionAudit[],
    chkList: VerificationChecklistState
  ) => {
    setStructuredData(updatedData);
    setCorrections(corrs);
    setChecklist(chkList);
    setCurrentStepIndex(6);
  };

  const handleFieldVerificationCompleted = (fieldRec: FieldVerificationRecord) => {
    setFieldVerification(fieldRec);
    setCurrentStepIndex(7);
  };

  const handleKYCCompleted = (kycRec: { status: any; providerName: string; message: string }) => {
    setKycRecord(kycRec);
    setCurrentStepIndex(8);
  };

  const handleFinalSubmit = async (finalConsentRec: FinalConsentRecord) => {
    setFinalConsent(finalConsentRec);

    // Evaluate confidence routing
    const overallScore = aiResult?.overallConfidence || 0.9;
    const isLowConfidence = overallScore < 0.75;
    const finalWorkflowStatus: DigitizationWorkflowStatus = isLowConfidence
      ? 'PENDING_HIGHER_REVIEW'
      : 'DIGITIZED';

    const caseDoc: DigitizationCaseDocument = {
      caseId,
      createdBy: 'AP-545-VRO-00101',
      assignedOfficer: 'AP-545-VRO-00101',
      sourceDocumentId: uploadRecord?.storageReference || `REF-${caseId}`,
      documentType,
      workflowStatus: finalWorkflowStatus,
      processingStatus: 'COMPLETED',
      ocrStatus: 'COMPLETED',
      extractionStatus: 'EXTRACTED',
      validationStatus: 'PASSED',
      reviewStatus: 'APPROVED',
      fieldVerificationStatus: 'VERIFIED',
      submissionStatus: 'FINALIZED',
      stateCode: '28',
      districtCode: '545',
      divisionCode: 'RD-545-01',
      mandalCode: '5102',
      villageCode: '600101',
      initialConsent,
      finalConsent: finalConsentRec,
      documentUpload: uploadRecord,
      ocrResult,
      extractedData: structuredData,
      aiConfidenceScore: overallScore,
      corrections,
      checklist,
      fieldVerification,
      kyc: kycRecord,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalizedAt: new Date().toISOString(),
    };

    // Save to Firestore
    try {
      await createDigitizationCase(caseDoc);
    } catch (err) {
      console.error('Failed to save digitization case to Firestore:', err);
    }

    setCompletedCaseDoc(caseDoc);
  };

  const handleResetWorkflow = () => {
    setCurrentStepIndex(1);
    setInitialConsent(undefined);
    setUploadRecord(undefined);
    setOcrResult(undefined);
    setAiResult(undefined);
    setStructuredData(undefined);
    setCorrections([]);
    setChecklist({});
    setFieldVerification(undefined);
    setFinalConsent(undefined);
    setCompletedCaseDoc(undefined);
  };

  if (completedCaseDoc) {
    return <DigitizationComplete caseDoc={completedCaseDoc} onReset={handleResetWorkflow} />;
  }

  return (
    <div>
      <WorkflowStepper
        steps={steps}
        currentStepId={currentStepIndex.toString()}
        onStepClick={(id) => {
          const target = parseInt(id);
          // Only allow navigating back to completed steps
          if (target < currentStepIndex) {
            setCurrentStepIndex(target);
          }
        }}
      />

      {/* Step Render Switch */}
      {currentStepIndex === 1 && (
        <VROConsentStep
          initialData={initialConsent}
          onConsentAccepted={handleConsentAccepted}
        />
      )}

      {currentStepIndex === 2 && (
        <DocumentTypeStep
          selectedType={documentType}
          onTypeSelected={handleTypeSelected}
          onBack={() => setCurrentStepIndex(1)}
        />
      )}

      {currentStepIndex === 3 && (
        <UploadStep
          documentType={documentType}
          initialUpload={uploadRecord}
          onUploadCompleted={handleUploadCompleted}
          onBack={() => setCurrentStepIndex(2)}
        />
      )}

      {currentStepIndex === 4 && uploadRecord && (
        <ProcessingStep
          uploadRecord={uploadRecord}
          documentType={documentType}
          onProcessingCompleted={handleProcessingCompleted}
          onRetry={() => setCurrentStepIndex(3)}
        />
      )}

      {currentStepIndex === 5 && uploadRecord && ocrResult && aiResult && (
        <ExtractionReviewStep
          documentType={documentType}
          uploadRecord={uploadRecord}
          ocrResult={ocrResult}
          aiResult={aiResult}
          initialCorrections={corrections}
          initialChecklist={checklist}
          onReviewCompleted={handleReviewCompleted}
          onBack={() => setCurrentStepIndex(3)}
        />
      )}

      {currentStepIndex === 6 && (
        <FieldVerificationStep
          initialVerification={fieldVerification}
          onVerificationCompleted={handleFieldVerificationCompleted}
          onBack={() => setCurrentStepIndex(5)}
        />
      )}

      {currentStepIndex === 7 && (
        <KYCStep
          initialStatus={kycRecord}
          onKYCCompleted={handleKYCCompleted}
          onBack={() => setCurrentStepIndex(6)}
        />
      )}

      {currentStepIndex === 8 && uploadRecord && structuredData && fieldVerification && (
        <FinalReviewStep
          documentType={documentType}
          uploadRecord={uploadRecord}
          structuredData={structuredData}
          corrections={corrections}
          checklist={checklist}
          fieldVerification={fieldVerification}
          kycRecord={kycRecord}
          initialFinalConsent={finalConsent}
          onFinalSubmitted={handleFinalSubmit}
          onBack={() => setCurrentStepIndex(7)}
        />
      )}

      {/* Sticky Bottom Action Bar */}
      <StickyActionBar>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-navy-900 uppercase">
            DIGITIZATION WORKFLOW • PHASE {currentStepIndex} OF {steps.length}
          </span>
          <span className="text-xs font-mono text-slate-500">({caseId})</span>
        </div>

        <div className="flex items-center gap-2">
          {currentStepIndex > 1 && (
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-bold text-navy-900 border border-slate-300 rounded hover:bg-slate-100"
              onClick={() => setCurrentStepIndex((prev) => Math.max(1, prev - 1))}
            >
              Previous Phase
            </button>
          )}
        </div>
      </StickyActionBar>
    </div>
  );
};
