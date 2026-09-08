'use client';

import React, { useEffect, useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import {
  SUPPORTED_DOCUMENT_TYPES,
  DocumentCategoryCode,
  StructuredLandRecordData,
  ExtractedField,
  PartyShare,
} from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult } from '@/lib/digitization/aiExtractionProvider';
import { FieldCorrectionAudit, VerificationChecklistState, DocumentUploadRecord } from '@/types/digitizationCase';
import {
  ShieldCheck,
  Edit3,
  CornerDownRight,
  CheckSquare,
  Info,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ExtractionReviewStepProps {
  documentType: DocumentCategoryCode;
  uploadRecord: DocumentUploadRecord;
  ocrResult: OCRResult;
  aiResult: AIExtractionResult;
  initialCorrections?: FieldCorrectionAudit[];
  initialChecklist?: VerificationChecklistState;
  onReviewCompleted: (
    updatedData: StructuredLandRecordData,
    corrections: FieldCorrectionAudit[],
    checklist: VerificationChecklistState
  ) => void;
  onValidityChange?: (isValid: boolean) => void;
  onBack?: () => void;
}

export const ExtractionReviewStep: React.FC<ExtractionReviewStepProps> = ({
  documentType,
  uploadRecord,
  aiResult,
  initialCorrections = [],
  initialChecklist = {},
  onReviewCompleted,
  onValidityChange,
}) => {
  const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === documentType) || SUPPORTED_DOCUMENT_TYPES[0];

  const [activeTab, setActiveTab] = useState<'split' | 'document' | 'fields'>('split');
  const [data, setData] = useState<StructuredLandRecordData>(aiResult.structuredData);
  const [corrections, setCorrections] = useState<FieldCorrectionAudit[]>(initialCorrections);
  const [checklist, setChecklist] = useState<VerificationChecklistState>(initialChecklist);

  // Editing state for fields
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');
  const [editReasonCode, setEditReasonCode] = useState<string>('OCR_ERROR');
  const [editError, setEditError] = useState<string | null>(null);

  // Check jurisdiction
  const valRes = (typeof window !== 'undefined' && (window as any).__LAST_VALIDATION_RESULT__) || null;
  const extractedDistrict = data.districtName?.value || '';
  const isJurisdictionBlocked = Boolean(
    valRes?.findings?.some(
      (f: any) =>
        f.ruleId === 'JURISDICTION-DIST-001' ||
        (f.field === 'districtName' && (f.severity === 'CRITICAL' || f.status === 'ERROR'))
    ) ||
      (extractedDistrict &&
        !extractedDistrict.toLowerCase().includes('kurnool') &&
        !extractedDistrict.includes('511') &&
        !extractedDistrict.includes('545'))
  );

  useEffect(() => {
    onValidityChange?.(!isJurisdictionBlocked);
    onReviewCompleted(data, corrections, checklist);
  }, [data, corrections, checklist, isJurisdictionBlocked]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditField = (fieldId: string, currentValue: string) => {
    setEditingFieldId(fieldId);
    setEditValue(currentValue || '');
    setEditReason('');
    setEditReasonCode('OCR_ERROR');
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingFieldId(null);
    setEditValue('');
    setEditReason('');
    setEditError(null);
  };

  const saveCorrection = (fieldId: string, originalVal: string) => {
    if (!editReason.trim()) {
      setEditError('Mandatory: Correction reason must be provided explaining why AI value was modified.');
      return;
    }

    const auditEntry: FieldCorrectionAudit = {
      fieldId,
      originalAIValue: originalVal,
      correctedValue: editValue.trim(),
      correctionReason: editReason.trim(),
      correctedByOfficerId: 'AP-545-VRO-00101',
      correctedAt: new Date().toISOString(),
    };

    setCorrections((prev) => [...prev.filter((c) => c.fieldId !== fieldId), auditEntry]);
    updateStructuredFieldValue(fieldId, editValue.trim());
    setChecklist((prev) => ({ ...prev, [fieldId]: true }));
    cancelEdit();
  };

  const updateStructuredFieldValue = (fieldId: string, newVal: string) => {
    setData((prev) => {
      const nextData = { ...prev };
      if (fieldId === 'ownerName') nextData.ownerName = { ...nextData.ownerName, value: newVal };
      else if (fieldId === 'fatherOrHusbandName') nextData.fatherOrHusbandName = { ...nextData.fatherOrHusbandName, value: newVal };
      else if (fieldId === 'surveyNumber') nextData.surveyNumber = { ...nextData.surveyNumber, value: newVal };
      else if (fieldId === 'subDivisionNumber') nextData.subDivisionNumber = { ...nextData.subDivisionNumber, value: newVal };
      else if (fieldId === 'khataNumber') nextData.khataNumber = { ...nextData.khataNumber, value: newVal };
      else if (fieldId === 'extentAcres') nextData.extentAcres = { ...nextData.extentAcres, value: newVal };
      else if (fieldId === 'landClassification') nextData.landClassification = { ...nextData.landClassification, value: newVal };
      else if (fieldId === 'villageName') nextData.villageName = { ...nextData.villageName, value: newVal };
      else if (fieldId === 'mandalName') nextData.mandalName = { ...nextData.mandalName, value: newVal };
      else if (fieldId === 'revenueDivision') nextData.revenueDivision = { ...nextData.revenueDivision, value: newVal };
      else if (fieldId === 'districtName') nextData.districtName = { ...nextData.districtName, value: newVal };
      else if (fieldId === 'boundaryEast') nextData.boundaries.east = { ...nextData.boundaries.east, value: newVal };
      else if (fieldId === 'boundaryWest') nextData.boundaries.west = { ...nextData.boundaries.west, value: newVal };
      else if (fieldId === 'boundaryNorth') nextData.boundaries.north = { ...nextData.boundaries.north, value: newVal };
      else if (fieldId === 'boundarySouth') nextData.boundaries.south = { ...nextData.boundaries.south, value: newVal };

      // Also update within dynamic custom sections if present
      if (nextData.customSections && nextData.customSections.length > 0) {
        nextData.customSections = nextData.customSections.map((sec) => ({
          ...sec,
          fields: sec.fields.map((f) => (f.fieldId === fieldId ? { ...f, value: newVal } : f)),
        }));
      }

      return nextData;
    });
  };

  const getConfidenceBadge = (confidence?: number) => {
    const score = typeof confidence === 'number' ? confidence : 0;
    const pct = Math.round(score * 100);

    if (score <= 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
          0% (NOT EXTRACTED / NULL)
        </span>
      );
    } else if (pct >= 85) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
          {pct}% HIGH CONFIDENCE
        </span>
      );
    } else if (pct >= 60) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          {pct}% MEDIUM CONFIDENCE
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
        {pct}% LOW CONFIDENCE
      </span>
    );
  };

  const renderGenericFieldCard = (
    fieldId: string,
    labelEn: string,
    labelTe: string | undefined,
    currentValue: string,
    confidence?: number,
    evidence?: { sourcePage: number; sourceText: string } | string
  ) => {
    const isVerified = !!checklist[fieldId];
    const correction = corrections.find((c) => c.fieldId === fieldId);
    const isEditing = editingFieldId === fieldId;

    const evidenceObj =
      typeof evidence === 'string'
        ? { sourcePage: 1, sourceText: evidence }
        : evidence;

    return (
      <div
        key={fieldId}
        className={`p-3 rounded-md border transition-all ${
          correction
            ? 'bg-amber-50/70 border-amber-300'
            : isVerified
            ? 'bg-green-50/40 border-slate-300'
            : 'bg-white border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`chk-${fieldId}`}
              checked={isVerified}
              onChange={() => toggleChecklist(fieldId)}
              className="w-4 h-4 text-navy-900 rounded border-slate-300 focus:ring-navy-800 cursor-pointer"
            />
            <label htmlFor={`chk-${fieldId}`} className="cursor-pointer font-bold text-navy-900 text-xs">
              {labelEn}
              {labelTe && (
                <span className="font-serif font-bold text-amber-800 ml-1 text-[11px]">
                  ({labelTe})
                </span>
              )}
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            {getConfidenceBadge(confidence)}
            {!isEditing && (
              <button
                type="button"
                onClick={() => startEditField(fieldId, currentValue)}
                className="px-2 py-0.5 hover:bg-slate-100 text-navy-800 rounded text-[11px] font-semibold border border-slate-300 flex items-center gap-1"
                title="Correct AI Value"
              >
                <Edit3 className="w-3 h-3 text-navy-700" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-1 pl-6">
            <div className="text-xs font-semibold text-slate-900 bg-white p-2 rounded border border-slate-200">
              {currentValue ? (
                <span>{currentValue}</span>
              ) : (
                <span className="text-slate-400 italic">Not Extracted / Null</span>
              )}
            </div>

            {evidenceObj && evidenceObj.sourceText && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <CornerDownRight className="w-3 h-3 text-slate-400" />
                <span>Source (Page {evidenceObj.sourcePage || 1}):</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 italic">
                  "{evidenceObj.sourceText}"
                </span>
              </div>
            )}

            {correction && (
              <div className="mt-1.5 p-2 bg-amber-100/70 border border-amber-300 rounded text-xs space-y-0.5 font-mono">
                <div className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                  <Info className="w-3 h-3 text-amber-800" />
                  <span>VRO Correction Recorded:</span>
                </div>
                <div className="text-[11px]">
                  AI: <span className="line-through text-slate-500">{correction.originalAIValue || 'null'}</span> →{' '}
                  <span className="font-bold text-navy-900">{correction.correctedValue}</span>
                </div>
                <div className="text-[11px] text-slate-700 font-serif italic">
                  Reason: "{correction.correctionReason}"
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 pl-6 p-2.5 bg-amber-50 rounded border border-amber-400 space-y-2.5">
            <div className="font-bold text-navy-900 text-xs">VRO CORRECTION MODE</div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Corrected Value:</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded border-slate-300 focus:ring-navy-800 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Controlled Correction Reason:</label>
              <select
                value={editReasonCode}
                onChange={(e) => setEditReasonCode(e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded border-slate-300 focus:ring-navy-800 font-mono"
              >
                <option value="OCR_ERROR">OCR Error</option>
                <option value="MANUAL_VERIFICATION">Manual Verification</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Explanation:</label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={2}
                className="w-full px-2 py-1 text-xs border rounded border-slate-300 focus:ring-navy-800"
              />
            </div>
            {editError && <p className="text-[11px] font-bold text-red-700 bg-red-100 p-1 rounded">{editError}</p>}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveCorrection(fieldId, currentValue)}
                className="px-3 py-1 bg-navy-900 text-white rounded text-xs font-bold hover:bg-navy-800 shadow-xs"
              >
                Save Correction
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFieldCard = (
    fieldId: string,
    fieldObj?: ExtractedField<string>,
    customLabelEn?: string,
    customLabelTe?: string
  ) => {
    if (!fieldObj) return null;
    return renderGenericFieldCard(
      fieldId,
      customLabelEn || fieldObj.labelEn,
      customLabelTe || fieldObj.labelTe,
      fieldObj.value,
      fieldObj.confidence,
      fieldObj.evidence
    );
  };

  const hasGroqChecklist = data.customChecklist && data.customChecklist.length > 0;
  const activeChecklistItems = hasGroqChecklist
    ? data.customChecklist!
    : docConfig.checklistFields.map((f) => ({
        id: f.id,
        labelEn: f.labelEn,
        labelTe: f.labelTe,
        verified: false,
        confidence: 0.9,
      }));

  const totalRequiredChecklist = activeChecklistItems.length;
  const verifiedChecklistCount = activeChecklistItems.filter((f) => checklist[f.id]).length;

  const displayDocTitleEn = data.documentTitle || docConfig.titleEn;
  const displayDocTitleTe = data.documentTitleTe || docConfig.titleTe;

  const hasGroqCustomSections = data.customSections && data.customSections.length > 0;

  return (
    <div className="space-y-4">
      {isJurisdictionBlocked && (
        <div className="bg-red-50 border-2 border-red-600 p-4 rounded-md shadow-sm text-red-950 flex items-start gap-3">
          <AlertCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-900 uppercase">JURISDICTION MISMATCH</h4>
            <p className="text-xs">Document indicates district: {extractedDistrict || 'Unknown'}. Kurnool District authorization required.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between bg-white border border-slate-300 p-2.5 rounded-md shadow-xs gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-navy-900" />
          <div>
            <span className="font-bold text-navy-900 text-xs uppercase block">CUSTOM DIGITIZATION WORKSPACE • {displayDocTitleEn}</span>
            <span className="font-serif text-[11px] text-amber-800">{displayDocTitleTe}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border text-xs">
          <button type="button" onClick={() => setActiveTab('split')} className={`px-3 py-1 rounded font-bold ${activeTab === 'split' ? 'bg-navy-900 text-white' : ''}`}>Split View</button>
          <button type="button" onClick={() => setActiveTab('document')} className="px-3 py-1 rounded md:hidden">Scan</button>
          <button type="button" onClick={() => setActiveTab('fields')} className="px-3 py-1 rounded md:hidden">Fields</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className={`md:col-span-6 ${activeTab === 'fields' ? 'hidden md:block' : 'block'}`}>
          <div className="bg-white p-3 border border-slate-300 rounded-md shadow-sm sticky top-4">
            <h4 className="font-bold text-navy-900 text-xs mb-2">ORIGINAL REVENUE SCAN</h4>
            <DocumentViewer originalFileName={uploadRecord.originalFileName} pageCount={uploadRecord.pageCount} />
          </div>
        </div>

        <div className={`md:col-span-6 space-y-3.5 ${activeTab === 'document' ? 'hidden md:block' : 'block'}`}>
          <div className="bg-navy-50 border border-navy-200 p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-navy-900" />
              <div>
                <span className="font-bold text-navy-900 text-xs uppercase">PROGRESS ({verifiedChecklistCount}/{totalRequiredChecklist})</span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs bg-white px-2 py-1 rounded border">{Math.round((verifiedChecklistCount / Math.max(1, totalRequiredChecklist)) * 100)}%</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-slate-300 space-y-2">
            <div className="text-[11px] font-bold text-navy-900 uppercase flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Document Type Checklist:</span>
            </div>
            <div className="space-y-1.5">
              {activeChecklistItems.map((item) => (
                <div key={item.id} className={`flex items-start justify-between p-2 rounded border text-xs ${checklist[item.id] ? 'bg-green-50' : 'bg-slate-50'}`}>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={!!checklist[item.id]} onChange={() => toggleChecklist(item.id)} className="w-4 h-4 cursor-pointer" />
                    <label className="font-bold">{item.labelEn}</label>
                  </div>
                  {getConfidenceBadge(item.confidence)}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 max-h-[640px] overflow-auto pr-1">
            {hasGroqCustomSections ? (
              data.customSections!.map((section, sIdx) => (
                <WorkspacePanel key={section.sectionId || sIdx} title={`${sIdx + 1}. ${section.sectionTitle.toUpperCase()}`}>
                  <div className="space-y-2.5">
                    {section.fields.map((field) =>
                      renderGenericFieldCard(field.fieldId, field.labelEn, field.labelTe, field.value, field.confidence, field.evidence)
                    )}
                  </div>
                </WorkspacePanel>
              ))
            ) : (
              <>
                <WorkspacePanel title="1. OWNER & IDENTITY">
                  <div className="space-y-2.5">
                    {renderFieldCard('ownerName', data.ownerName)}
                    {renderFieldCard('fatherOrHusbandName', data.fatherOrHusbandName)}
                  </div>
                </WorkspacePanel>
                <WorkspacePanel title="2. LAND IDENTIFICATION">
                  <div className="space-y-2.5">
                    {renderFieldCard('surveyNumber', data.surveyNumber)}
                    {renderFieldCard('extentAcres', data.extentAcres)}
                  </div>
                </WorkspacePanel>
                <WorkspacePanel title="3. ADMINISTRATIVE JURISDICTION">
                  <div className="space-y-2.5">
                    {renderFieldCard('villageName', data.villageName)}
                    {renderFieldCard('districtName', data.districtName)}
                  </div>
                </WorkspacePanel>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
