'use client';

import React from 'react';
import { DocumentUploadRecord } from '@/types/digitizationCase';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult, DefaultAIExtractionProvider } from '@/lib/digitization/aiExtractionProvider';
import { ProcessingPipelineWorkspace } from '../ProcessingPipelineWorkspace';
import { NormalizedDocumentRepresentation } from '@/types/documentProcessingJob';

import { MasterDataResolver } from '@/lib/digitization/validation/masterDataResolver';

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
      const masterResolver = new MasterDataResolver();
      const getFieldVal = (val: any) => {
        if (val === null || val === undefined || val === 'null' || val === '') return null;
        return String(val).trim();
      };

      const getConfScore = (fieldKey: string, aiScore?: number) => {
        if (typeof aiScore === 'number') return aiScore;
        const c = realConf[fieldKey]?.confidenceScore;
        if (typeof c === 'number') return c;
        const val = (realExtract as any)[fieldKey];
        if (val !== null && val !== undefined && val !== '' && val !== 'null') {
          return 0.90;
        }
        return 0.0;
      };

      const getEvidence = (fieldKey: string, aiEv?: string) => {
        if (aiEv && aiEv !== 'null') return { sourceText: aiEv, sourcePage: 1 };
        const ev = realConf[fieldKey]?.evidenceSnippet;
        if (ev && ev !== 'null') return { sourceText: ev, sourcePage: 1 };
        return undefined;
      };

      const rawDist = getFieldVal(realExtract.districtName || realExtract.district);
      const distRes = rawDist ? masterResolver.resolveDistrict(rawDist) : null;
      const resolvedDist = distRes?.matchedName || (rawDist && (rawDist.includes('కర్నూలు') || rawDist.includes('కర్నూల్')) ? 'Kurnool' : rawDist);

      const rawMan = getFieldVal(realExtract.mandalName || realExtract.mandal);
      const manRes = rawMan ? masterResolver.resolveMandal(rawMan) : null;
      const resolvedMan = manRes?.matchedName || rawMan;

      const rawVil = getFieldVal(realExtract.villageName || realExtract.village);
      const vilRes = rawVil ? masterResolver.resolveVillage(rawVil) : null;
      const resolvedVil = vilRes?.matchedName || rawVil;

      const structuredData: any = {
        ownerName: {
          fieldId: 'ownerName',
          labelEn: 'Pattadar / Owner Name',
          labelTe: 'పట్టాదారు పేరు',
          value: getFieldVal(realExtract.ownerName),
          confidence: getConfScore('ownerName', realExtract.ownerConfidence),
          evidence: getEvidence('ownerName', realExtract.ownerEvidence),
        },
        fatherOrHusbandName: {
          fieldId: 'fatherOrHusbandName',
          labelEn: 'Father / Husband / Guardian Name',
          labelTe: 'తండ్రి / భర్త పేరు',
          value: getFieldVal(realExtract.fatherOrHusbandName),
          confidence: getConfScore('fatherOrHusbandName', realExtract.fatherConfidence),
          evidence: getEvidence('fatherOrHusbandName', realExtract.fatherEvidence),
        },
        surveyNumber: {
          fieldId: 'surveyNumber',
          labelEn: 'Survey Number',
          labelTe: 'సర్వే నంబరు',
          value: getFieldVal(realExtract.surveyNumber),
          confidence: getConfScore('surveyNumber', realExtract.surveyConfidence),
          evidence: getEvidence('surveyNumber', realExtract.surveyEvidence),
        },
        subDivisionNumber: {
          fieldId: 'subDivisionNumber',
          labelEn: 'Sub-Division Number',
          labelTe: 'సబ్‌డివిజన్ నంబరు',
          value: getFieldVal(realExtract.subDivisionNumber),
          confidence: getConfScore('subDivisionNumber', realExtract.subDivisionConfidence),
          evidence: getEvidence('subDivisionNumber', realExtract.subDivisionEvidence),
        },
        khataNumber: {
          fieldId: 'khataNumber',
          labelEn: 'Khata Number',
          labelTe: 'ఖాతా నంబరు',
          value: getFieldVal(realExtract.khataNumber),
          confidence: getConfScore('khataNumber', realExtract.khataConfidence),
          evidence: getEvidence('khataNumber', realExtract.khataEvidence),
        },
        extentAcres: {
          fieldId: 'extentAcres',
          labelEn: 'Extent (Acres.Cents)',
          labelTe: 'విస్తీర్ణం (ఎకరాలు.సెంట్లు)',
          value: getFieldVal(realExtract.extentAcres || realExtract.extent),
          confidence: getConfScore('extent', realExtract.extentConfidence),
          evidence: getEvidence('extent', realExtract.extentEvidence),
        },
        landClassification: {
          fieldId: 'landClassification',
          labelEn: 'Land Classification',
          labelTe: 'భూమి వర్గీకరణ',
          value: getFieldVal(realExtract.landClassification),
          confidence: getConfScore('landClassification', realExtract.classificationConfidence),
          evidence: getEvidence('landClassification', realExtract.classificationEvidence),
        },
        villageName: {
          fieldId: 'villageName',
          labelEn: 'Village Name',
          labelTe: 'గ్రామం పేరు',
          value: resolvedVil,
          confidence: getConfScore('village', realExtract.villageConfidence),
          evidence: getEvidence('village', realExtract.villageEvidence),
        },
        mandalName: {
          fieldId: 'mandalName',
          labelEn: 'Mandal Name',
          labelTe: 'మండలం పేరు',
          value: resolvedMan,
          confidence: getConfScore('mandal', realExtract.mandalConfidence),
          evidence: getEvidence('mandal', realExtract.mandalEvidence),
        },
        revenueDivision: {
          fieldId: 'revenueDivision',
          labelEn: 'Revenue Division',
          labelTe: 'రెవెన్యూ డివిజన్',
          value: getFieldVal(realExtract.revenueDivision),
          confidence: getConfScore('revenueDivision', realExtract.revenueDivisionConfidence),
        },
        districtName: {
          fieldId: 'districtName',
          labelEn: 'District Name',
          labelTe: 'జిల్లా పేరు',
          value: resolvedDist,
          confidence: getConfScore('district', realExtract.districtConfidence),
          evidence: getEvidence('district', realExtract.districtEvidence),
        },
        documentDate: {
          fieldId: 'documentDate',
          labelEn: 'Record / Proceeding Date',
          labelTe: 'రికార్డు / ప్రొసీడింగ్ తేదీ',
          value: getFieldVal(realExtract.documentDate),
          confidence: getConfScore('documentDate', realExtract.dateConfidence),
        },
        registrationRef: {
          fieldId: 'registrationRef',
          labelEn: 'Registration / Document No',
          labelTe: 'రిజిస్ట్రేషన్ / పత్రం సంఖ్య',
          value: getFieldVal(realExtract.registrationNumber || realExtract.registrationRef),
          confidence: getFieldVal(realExtract.registrationNumber) ? 0.90 : 0.0,
        },
        mutationRef: {
          fieldId: 'mutationRef',
          labelEn: 'Mutation Proceeding Ref',
          labelTe: 'మ్యూటేషన్ నడపడి సంఖ్య',
          value: getFieldVal(realExtract.mutationReference || realExtract.mutationRef),
          confidence: getFieldVal(realExtract.mutationReference) ? 0.90 : 0.0,
        },
        boundaries: {
          east: {
            fieldId: 'boundaryEast',
            labelEn: 'East Boundary',
            labelTe: 'తూర్పు సరిహద్దు',
            value: getFieldVal(realBoundaries.east || realExtract.boundaries?.east),
            confidence: getFieldVal(realBoundaries.east || realExtract.boundaries?.east) ? (realExtract.boundaries?.confidence || 0.90) : 0.0,
          },
          west: {
            fieldId: 'boundaryWest',
            labelEn: 'West Boundary',
            labelTe: 'పశ్చిమ సరిహద్దు',
            value: getFieldVal(realBoundaries.west || realExtract.boundaries?.west),
            confidence: getFieldVal(realBoundaries.west || realExtract.boundaries?.west) ? (realExtract.boundaries?.confidence || 0.90) : 0.0,
          },
          north: {
            fieldId: 'boundaryNorth',
            labelEn: 'North Boundary',
            labelTe: 'ఉత్తర సరిహద్దు',
            value: getFieldVal(realBoundaries.north || realExtract.boundaries?.north),
            confidence: getFieldVal(realBoundaries.north || realExtract.boundaries?.north) ? (realExtract.boundaries?.confidence || 0.90) : 0.0,
          },
          south: {
            fieldId: 'boundarySouth',
            labelEn: 'South Boundary',
            labelTe: 'దక్షిణ సరిహద్దు',
            value: getFieldVal(realBoundaries.south || realExtract.boundaries?.south),
            confidence: getFieldVal(realBoundaries.south || realExtract.boundaries?.south) ? (realExtract.boundaries?.confidence || 0.90) : 0.0,
          },
        },
        customSections: realExtract.customSections || [],
        customChecklist: realExtract.checklist || [],
        documentTitle: realExtract.documentTitle,
        documentTitleTe: realExtract.documentTitleTe,
      };

      const computedOverall =
        typeof realExtract.overallConfidence === 'number'
          ? realExtract.overallConfidence
          : typeof pipelineData?.confidenceResult?.documentSummary?.overallConfidenceScore === 'number'
          ? pipelineData?.confidenceResult?.documentSummary?.overallConfidenceScore
          : 0.0;

      const aiResult: AIExtractionResult = {
        documentType: normDoc.finalDocumentType as DocumentCategoryCode,
        structuredData: structuredData as any,
        overallConfidence: computedOverall,
        providerName: 'Llama API Document Text Extractor + Groq Cloud Structured AI',
        modelIdentifier: 'Llama-3.2-Vision + Groq-LandRecord-Extractor',
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
