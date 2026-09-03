'use client';

import React from 'react';
import { DocumentUploadRecord } from '@/types/digitizationCase';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult, DefaultAIExtractionProvider } from '@/lib/digitization/aiExtractionProvider';
import { ProcessingPipelineWorkspace } from '../ProcessingPipelineWorkspace';
import { NormalizedDocumentRepresentation } from '@/types/documentProcessingJob';

interface ProcessingStepProps {
  uploadRecord: DocumentUploadRecord;
  documentType: DocumentCategoryCode;
  onProcessingCompleted: (ocrResult: OCRResult, aiResult: AIExtractionResult) => void;
  onRetry: () => void;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  uploadRecord,
  documentType,
  onProcessingCompleted,
  onRetry,
}) => {
  const handlePipelineCompleted = async (normDoc: NormalizedDocumentRepresentation) => {
    const pipelineData = (window as any).__LAST_PIPELINE_RESULT__;
    const realExtract = pipelineData?.extractionResult?.aiExtractedRecord;
    const realConf = pipelineData?.confidenceResult?.fieldsConfidence || {};
    const realBoundaries = pipelineData?.extractionResult?.boundaries || {};

    if (realExtract) {
      const getFieldVal = (val: any) => (val && val !== 'null' && val !== 'None' ? String(val) : '');
      const getConfScore = (fName: string) => {
        const c = realConf[fName];
        return c && c.score !== null && c.score !== undefined ? c.score : 0.85;
      };

      const structuredData = {
        ownerName: {
          fieldId: 'ownerName',
          labelEn: 'Pattadar / Owner Name',
          labelTe: 'పట్టాదారు పేరు',
          value: getFieldVal(realExtract.ownerName),
          confidence: getConfScore('ownerName'),
        },
        fatherOrHusbandName: {
          fieldId: 'fatherOrHusbandName',
          labelEn: 'Father / Husband Name',
          labelTe: 'తండ్రి / భర్త పేరు',
          value: getFieldVal(realExtract.fatherOrHusbandName),
          confidence: getConfScore('fatherOrHusbandName'),
        },
        surveyNumber: {
          fieldId: 'surveyNumber',
          labelEn: 'Survey Number',
          labelTe: 'సర్వే నంబరు',
          value: getFieldVal(realExtract.surveyNumber),
          confidence: getConfScore('surveyNumber'),
        },
        subDivisionNumber: {
          fieldId: 'subDivisionNumber',
          labelEn: 'Sub-Division Number',
          labelTe: 'సబ్‌డివిజన్ నంబరు',
          value: getFieldVal(realExtract.subDivisionNumber),
          confidence: getConfScore('subDivisionNumber'),
        },
        khataNumber: {
          fieldId: 'khataNumber',
          labelEn: 'Khata Number',
          labelTe: 'ఖాతా నంబరు',
          value: getFieldVal(realExtract.khataNumber),
          confidence: getConfScore('khataNumber'),
        },
        extentAcres: {
          fieldId: 'extentAcres',
          labelEn: 'Extent (Acres.Cents)',
          labelTe: 'విస్తీర్ణం (ఎకరాలు.సెంట్లు)',
          value: getFieldVal(realExtract.extent),
          confidence: getConfScore('extent'),
        },
        landClassification: {
          fieldId: 'landClassification',
          labelEn: 'Land Classification',
          labelTe: 'భూమి వర్గీకరణ',
          value: getFieldVal(realExtract.landClassification),
          confidence: getConfScore('landClassification'),
        },
        villageName: {
          fieldId: 'villageName',
          labelEn: 'Village Name',
          labelTe: 'గ్రామం పేరు',
          value: getFieldVal(realExtract.village),
          confidence: getConfScore('village'),
        },
        mandalName: {
          fieldId: 'mandalName',
          labelEn: 'Mandal Name',
          labelTe: 'మండలం పేరు',
          value: getFieldVal(realExtract.mandal),
          confidence: getConfScore('mandal'),
        },
        revenueDivision: {
          fieldId: 'revenueDivision',
          labelEn: 'Revenue Division',
          labelTe: 'రెవెన్యూ డివిజన్',
          value: getFieldVal(realExtract.revenueDivision),
          confidence: getConfScore('revenueDivision'),
        },
        districtName: {
          fieldId: 'districtName',
          labelEn: 'District Name',
          labelTe: 'జిల్లా పేరు',
          value: getFieldVal(realExtract.district),
          confidence: getConfScore('district'),
        },
        documentDate: {
          fieldId: 'documentDate',
          labelEn: 'Record / Proceeding Date',
          labelTe: 'రికార్డు / ప్రొసీడింగ్ తేదీ',
          value: getFieldVal(realExtract.documentDate),
          confidence: getConfScore('documentDate'),
        },
        boundaries: {
          east: {
            fieldId: 'boundaryEast',
            labelEn: 'East Boundary',
            labelTe: 'తూర్పు సరిహద్దు',
            value: getFieldVal(realBoundaries.east),
            confidence: 0.90,
          },
          west: {
            fieldId: 'boundaryWest',
            labelEn: 'West Boundary',
            labelTe: 'పశ్చిమ సరిహద్దు',
            value: getFieldVal(realBoundaries.west),
            confidence: 0.90,
          },
          north: {
            fieldId: 'boundaryNorth',
            labelEn: 'North Boundary',
            labelTe: 'ఉత్తర సరిహద్దు',
            value: getFieldVal(realBoundaries.north),
            confidence: 0.90,
          },
          south: {
            fieldId: 'boundarySouth',
            labelEn: 'South Boundary',
            labelTe: 'దక్షిణ సరిహద్దు',
            value: getFieldVal(realBoundaries.south),
            confidence: 0.90,
          },
        },
      };

      const aiResult: AIExtractionResult = {
        documentType: normDoc.finalDocumentType as DocumentCategoryCode,
        structuredData: structuredData as any,
        overallConfidence: pipelineData?.confidenceResult?.documentSummary?.overallConfidenceScore || 0.88,
        providerName: 'Python AIExtractionProvider, ConfidenceEngine, ValidationEngine & CrossDatabaseVerifier (Phase 2-5)',
        modelIdentifier: 'eBhoomi-LandRecord-NER-v5.0',
        extractedAt: new Date().toISOString(),
      };

      (window as any).__LAST_VALIDATION_RESULT__ = pipelineData?.validationResult || null;
      (window as any).__LAST_CROSS_VERIFY_RESULT__ = pipelineData?.crossVerifyResult || null;

      onProcessingCompleted(normDoc.ocr, aiResult);
      return;
    }

    // Fallback if pipeline result was missing
    const aiProvider = new DefaultAIExtractionProvider();
    const aiResult = await aiProvider.extractStructuredData(
      normDoc.ocr,
      normDoc.finalDocumentType as DocumentCategoryCode
    );

    onProcessingCompleted(normDoc.ocr, aiResult);
  };

  return (
    <ProcessingPipelineWorkspace
      uploadRecord={uploadRecord}
      vroSelectedDocumentType={documentType}
      onPipelineCompleted={handlePipelineCompleted}
      onRetryUpload={onRetry}
    />
  );
};
