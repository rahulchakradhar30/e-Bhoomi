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
import { createLandRecord } from '@/lib/services/landRecordService';
import { LandRecordDocument } from '@/types/landRecord';
import { getRevenueDivisions, getSubdistricts, getVillages, getSachivalayams, getSachivalayamsForVillage } from '@/services/administrativeDataService';
import { useCurrentUser } from '@/context/AuthContext';

export const DocumentDigitization: React.FC = () => {
  const { officerProfile } = useCurrentUser();
  const officerId = officerProfile?.officerId || 'AP-545-VRO-00101';

  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [caseId] = useState(() => `DIG-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`);

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
        const draft = await getActiveDraftForOfficer(officerId);
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
  }, [officerId]);

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
      createdBy: officerId,
      assignedOfficer: officerId,
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
          finalAcceptedBy: officerId,
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

    // Dynamically resolve authoritative administrative location hierarchy from master data
    const rawDist = structuredData?.districtName?.value || 'Kurnool';
    const rawDiv = structuredData?.revenueDivision?.value || '';
    const rawMandal = structuredData?.mandalName?.value || 'Kallur';
    const rawVillage = structuredData?.villageName?.value || 'Lakshmipuram';
    const rawSach = structuredData?.sachivalayamName?.value || '';

    // 1. Revenue Division
    const allDivs = getRevenueDivisions('511');
    const matchedDiv = allDivs.find(
      (d) =>
        d.division_code === rawDiv ||
        d.name.toLowerCase() === rawDiv.toLowerCase() ||
        rawDiv.toLowerCase().includes(d.name.toLowerCase().replace(' revenue division', ''))
    ) || allDivs[1] || allDivs[0];

    const divCode = matchedDiv ? matchedDiv.division_code : 'RD-511-KURNOOL';
    const divName = matchedDiv ? matchedDiv.name : 'Kurnool Revenue Division';

    // 2. Mandal
    const allMandals = getSubdistricts('28', '511', divCode);
    const matchedMandal = allMandals.find(
      (m) =>
        m.name.toLowerCase() === rawMandal.toLowerCase() ||
        rawMandal.toLowerCase().includes(m.name.toLowerCase()) ||
        m.subdistrict_code === rawMandal
    ) || allMandals[0];

    const mandalCode = matchedMandal ? matchedMandal.subdistrict_code : '5170';
    const mandalName = matchedMandal ? matchedMandal.name : rawMandal;

    // 3. Village / Locality
    const allVillages = getVillages(mandalCode);
    const matchedVillage = allVillages.find(
      (v) =>
        v.name.toLowerCase() === rawVillage.toLowerCase() ||
        rawVillage.toLowerCase().includes(v.name.toLowerCase()) ||
        v.village_code === rawVillage
    ) || allVillages[0];

    const villageCode = matchedVillage ? matchedVillage.village_code : 'LOC-5170-LAKSHMIPURAM';
    const villageName = matchedVillage ? matchedVillage.name : rawVillage;

    // 4. Sachivalayam
    const allSach = getSachivalayamsForVillage(villageCode, mandalCode);
    const matchedSach = allSach.find(
      (s) =>
        s.name.toLowerCase() === rawSach.toLowerCase() ||
        (rawSach && rawSach.toLowerCase().includes(s.name.toLowerCase())) ||
        s.sachivalayam_code === rawSach
    ) || allSach[0];

    const sachivalayamCode = matchedSach ? matchedSach.sachivalayam_code : '11390497';
    const sachivalayamName = matchedSach ? matchedSach.name : (rawSach || villageName);

    const caseDoc: DigitizationCaseDocument = {
      caseId,
      createdBy: officerId,
      assignedOfficer: officerId,
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
      districtCode: '511',
      divisionCode: divCode,
      mandalCode: mandalCode,
      villageCode: villageCode,
      sachivalayamCode: sachivalayamCode,
      sachivalayamName: sachivalayamName,
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

    const landRecDoc: LandRecordDocument = {
      recordId: `REC-AP-KUR-${caseId}`,
      stateId: '28',
      districtId: '511',
      revenueDivisionId: divCode,
      mandalOrTalukId: mandalCode,
      villageId: villageCode,
      sachivalayamId: sachivalayamCode,
      stateName: 'Andhra Pradesh',
      districtName: 'Kurnool',
      revenueDivisionName: divName,
      mandalName: mandalName,
      villageName: villageName,
      sachivalayamName: sachivalayamName,
      surveyNumber: structuredData?.surveyNumber?.value || '101',
      subDivisionNumber: structuredData?.subDivisionNumber?.value || '1',
      khataNumber: structuredData?.khataNumber?.value || '',
      extent: parseFloat(structuredData?.extentAcres?.value || '0') || 1.0,
      landClassification: structuredData?.landClassification?.value || 'Dry Agricultural (Patta)',
      landType: structuredData?.landClassification?.value || 'Dry Agricultural (Patta)',
      recordType: documentType || 'ROR_1B',
      status: 'ACTIVE',
      digitizationStatus: 'Digitized',
      verificationStatus: 'VERIFIED',
      currentVersionId: `AP-REV-${Date.now().toString(36).toUpperCase()}`,
      owners: [
        {
          id: `OWN-${Date.now()}`,
          name: structuredData?.ownerName?.value || 'Authorized Pattadar',
          fatherOrHusbandName: structuredData?.fatherOrHusbandName?.value || '',
          extentAcres: parseFloat(structuredData?.extentAcres?.value || '0') || 1.0,
          relationType: 'PATTADAR',
        },
      ],
      boundaries: {
        north: structuredData?.boundaries?.north?.value,
        south: structuredData?.boundaries?.south?.value,
        east: structuredData?.boundaries?.east?.value,
        west: structuredData?.boundaries?.west?.value,
      },
      documentReferences: [uploadRecord?.storageReference || `REF-${caseId}`],
      createdBy: officerId,
      verifiedBy: officerId,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createDigitizationCase(caseDoc);
      await createLandRecord(landRecDoc);
    } catch (err) {
      console.error('Failed to save digitization case or land record to Firestore:', err);
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
      canGoBack={currentStepIndex > 1}
      canProceed={isCurrentStepValid}
      onPrevious={handlePrevious}
      onProceed={handleProceedNext}
      onSaveDraft={handleSaveDraft}
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
          onValidityChange={(valid) => setIsCurrentStepValid(valid)}
          onReviewCompleted={(updatedData, corrs, chkList) => {
            setStructuredData(updatedData);
            setCorrections(corrs);
            setChecklist(chkList);
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
