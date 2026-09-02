'use client';

import React, { useEffect, useState } from 'react';
import { DigitizationWorkspaceLayout } from '../digitization/layout/DigitizationWorkspaceLayout';
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
import { createDigitizationCase, getActiveDraftForOfficer, saveDigitizationDraft } from '@/lib/services/digitizationService';

export const DocumentDigitization: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [caseId] = useState(() => `DIG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

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
    message: 'KYC service gateway active. Official UIDAI service link pending authorization.',
  });
  const [finalConsent, setFinalConsent] = useState<FinalConsentRecord | undefined>();
  const [completedCaseDoc, setCompletedCaseDoc] = useState<DigitizationCaseDocument | undefined>();

  // Validation flags for current step
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);

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

  // Update step validity state depending on step
  useEffect(() => {
    switch (currentStepIndex) {
      case 1:
        setIsCurrentStepValid(!!initialConsent?.consentAccepted);
        break;
      case 2:
        setIsCurrentStepValid(!!documentType);
        break;
      case 3:
        setIsCurrentStepValid(!!uploadRecord);
        break;
      case 4:
        setIsCurrentStepValid(!!ocrResult && !!structuredData);
        break;
      case 5:
        setIsCurrentStepValid(!!structuredData);
        break;
      case 6:
        setIsCurrentStepValid(!!fieldVerification && fieldVerification.photos.length >= 4);
        break;
      case 7:
        setIsCurrentStepValid(true);
        break;
      case 8:
        setIsCurrentStepValid(!!finalConsent?.finalConsentAccepted);
        break;
      default:
        setIsCurrentStepValid(true);
    }
  }, [currentStepIndex, initialConsent, documentType, uploadRecord, ocrResult, structuredData, fieldVerification, finalConsent]);

  const handleSaveDraft = async () => {
    const draftDoc: Partial<DigitizationCaseDocument> = {
      caseId,
      createdBy: 'AP-545-VRO-00101',
      assignedOfficer: 'AP-545-VRO-00101',
      documentType,
      workflowStatus: 'DRAFT',
      initialConsent,
      documentUpload: uploadRecord,
      ocrResult,
      extractedData: structuredData,
      corrections,
      checklist,
      fieldVerification,
      kyc: kycRecord,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveDigitizationDraft(draftDoc);
    } catch (err) {
      console.error('Draft save failed:', err);
    }
  };

  const handleProceedNext = () => {
    if (currentStepIndex < 8) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinalSubmit(
        finalConsent || {
          finalConsentAccepted: true,
          finalAcceptedAt: new Date().toISOString(),
          finalAcceptedBy: 'AP-545-VRO-00101',
          declarationText: 'I confirm that I have reviewed the record and accept responsibility.',
        }
      );
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 1) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = async (finalConsentRec: FinalConsentRecord) => {
    setFinalConsent(finalConsentRec);

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
    <DigitizationWorkspaceLayout
      currentStepIndex={currentStepIndex}
      caseId={caseId}
      workflowStatus={uploadRecord ? 'PROCESSING' : 'DRAFT'}
      originalFileName={uploadRecord?.originalFileName}
      officerId="AP-545-VRO-00101"
      canGoBack={currentStepIndex > 1}
      canProceed={isCurrentStepValid}
      onPrevious={handlePrevious}
      onProceed={handleProceedNext}
      onSaveDraft={handleSaveDraft}
      onStepClick={(targetIndex) => {
        if (targetIndex < currentStepIndex) {
          setCurrentStepIndex(targetIndex);
        }
      }}
    >
      {/* Step 1: VRO Consent */}
      {currentStepIndex === 1 && (
        <VROConsentStep
          initialData={initialConsent}
          onConsentAccepted={(rec) => {
            setInitialConsent(rec);
            setIsCurrentStepValid(true);
          }}
          onValidityChange={(valid) => setIsCurrentStepValid(valid)}
        />
      )}

      {/* Step 2: Document Type */}
      {currentStepIndex === 2 && (
        <DocumentTypeStep
          selectedType={documentType}
          onTypeSelected={(docType) => {
            setDocumentType(docType);
            setIsCurrentStepValid(true);
          }}
        />
      )}

      {/* Step 3: Document Upload */}
      {currentStepIndex === 3 && (
        <UploadStep
          documentType={documentType}
          initialUpload={uploadRecord}
          onUploadCompleted={(rec) => {
            setUploadRecord(rec);
            setIsCurrentStepValid(true);
          }}
          onValidityChange={(valid) => setIsCurrentStepValid(valid)}
        />
      )}

      {/* Step 4: Processing & OCR */}
      {currentStepIndex === 4 && uploadRecord && (
        <ProcessingStep
          uploadRecord={uploadRecord}
          documentType={documentType}
          onProcessingCompleted={(ocrRes, aiRes) => {
            setOcrResult(ocrRes);
            setAiResult(aiRes);
            setStructuredData(aiRes.structuredData);
            setIsCurrentStepValid(true);
          }}
          onRetry={() => setCurrentStepIndex(3)}
        />
      )}

      {/* Step 5: AI Extraction Review */}
      {currentStepIndex === 5 && uploadRecord && ocrResult && aiResult && (
        <ExtractionReviewStep
          documentType={documentType}
          uploadRecord={uploadRecord}
          ocrResult={ocrResult}
          aiResult={aiResult}
          initialCorrections={corrections}
          initialChecklist={checklist}
          onReviewCompleted={(updatedData, corrs, chkList) => {
            setStructuredData(updatedData);
            setCorrections(corrs);
            setChecklist(chkList);
            setIsCurrentStepValid(true);
          }}
        />
      )}

      {/* Step 6: Field Verification */}
      {currentStepIndex === 6 && (
        <FieldVerificationStep
          initialVerification={fieldVerification}
          onVerificationCompleted={(fieldRec) => {
            setFieldVerification(fieldRec);
            setIsCurrentStepValid(fieldRec.photos.length >= 4);
          }}
          onValidityChange={(valid) => setIsCurrentStepValid(valid)}
        />
      )}

      {/* Step 7: KYC Status Check */}
      {currentStepIndex === 7 && (
        <KYCStep
          initialStatus={kycRecord}
          onKYCCompleted={(kycRec) => {
            setKycRecord(kycRec);
            setIsCurrentStepValid(true);
          }}
          onBack={() => setCurrentStepIndex(6)}
        />
      )}

      {/* Step 8: Final Review & Consent */}
      {currentStepIndex === 8 && uploadRecord && structuredData && (
        <FinalReviewStep
          documentType={documentType}
          uploadRecord={uploadRecord}
          structuredData={structuredData}
          corrections={corrections}
          checklist={checklist}
          fieldVerification={fieldVerification || { photos: [], status: 'VERIFIED', notes: '', verifiedByOfficerId: 'AP-545-VRO-00101', verifiedAt: new Date().toISOString() }}
          kycRecord={kycRecord}
          initialFinalConsent={finalConsent}
          onFinalSubmitted={(consentRec) => {
            setFinalConsent(consentRec);
            setIsCurrentStepValid(true);
          }}
          onValidityChange={(valid) => setIsCurrentStepValid(valid)}
        />
      )}
    </DigitizationWorkspaceLayout>
  );
};
