'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode, StructuredLandRecordData, ExtractedField, PartyShare } from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult } from '@/lib/digitization/aiExtractionProvider';
import { FieldCorrectionAudit, VerificationChecklistState, DocumentUploadRecord } from '@/types/digitizationCase';
import { ShieldCheck, Edit3, CornerDownRight, CheckSquare, Info, User, MapPin, Layers, Compass, Users } from 'lucide-react';

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
  onBack?: () => void;
}

export const ExtractionReviewStep: React.FC<ExtractionReviewStepProps> = ({
  documentType,
  uploadRecord,
  aiResult,
  initialCorrections = [],
  initialChecklist = {},
  onReviewCompleted,
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
  const [editError, setEditError] = useState<string | null>(null);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditField = (fieldId: string, currentValue: string) => {
    setEditingFieldId(fieldId);
    setEditValue(currentValue);
    setEditReason('');
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
      return nextData;
    });
  };

  const getConfidenceBadge = (confidence: number) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 90) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
          {pct}% CONFIDENCE
        </span>
      );
    } else if (pct >= 75) {
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

  const renderFieldCard = (
    fieldId: string,
    fieldObj?: ExtractedField<string>,
    customLabelEn?: string,
    customLabelTe?: string
  ) => {
    if (!fieldObj) return null;

    const isVerified = !!checklist[fieldId];
    const correction = corrections.find((c) => c.fieldId === fieldId);
    const isEditing = editingFieldId === fieldId;

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
              {customLabelEn || fieldObj.labelEn}
              <span className="font-serif font-bold text-amber-800 ml-1 text-[11px]">
                ({customLabelTe || fieldObj.labelTe})
              </span>
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            {getConfidenceBadge(fieldObj.confidence)}
            {!isEditing && (
              <button
                type="button"
                onClick={() => startEditField(fieldId, fieldObj.value)}
                className="px-2 py-0.5 hover:bg-slate-100 text-navy-800 rounded text-[11px] font-semibold border border-slate-300 flex items-center gap-1"
                title="Correct AI Value"
              >
                <Edit3 className="w-3 h-3 text-navy-700" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Value Display / Edit Form */}
        {!isEditing ? (
          <div className="space-y-1 pl-6">
            <div className="text-xs font-semibold text-slate-900 bg-white p-2 rounded border border-slate-200">
              {fieldObj.value || <span className="text-slate-400 italic">Not Available</span>}
            </div>

            {/* Source Evidence */}
            {fieldObj.evidence && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <CornerDownRight className="w-3 h-3 text-slate-400" />
                <span>Source (Page {fieldObj.evidence.sourcePage}):</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 italic">
                  "{fieldObj.evidence.sourceText}"
                </span>
              </div>
            )}

            {/* Correction Audit Trace */}
            {correction && (
              <div className="mt-1.5 p-2 bg-amber-100/70 border border-amber-300 rounded text-xs space-y-0.5 font-mono">
                <div className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                  <Info className="w-3 h-3 text-amber-800" />
                  <span>VRO Correction Recorded:</span>
                </div>
                <div className="text-[11px]">
                  AI: <span className="line-through text-slate-500">{correction.originalAIValue}</span> →{' '}
                  <span className="font-bold text-navy-900">{correction.correctedValue}</span>
                </div>
                <div className="text-[11px] text-slate-700 font-serif italic">
                  Reason: "{correction.correctionReason}"
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Inline Correction Form */
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
              <label className="text-[11px] font-bold text-slate-700 block">
                Mandatory Correction Reason:
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={2}
                className="w-full px-2 py-1 text-xs border rounded border-slate-300 focus:ring-navy-800"
                placeholder="Explain why AI value was modified..."
              />
            </div>

            {editError && <p className="text-[11px] font-bold text-red-700 bg-red-100 p-1 rounded">{editError}</p>}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => saveCorrection(fieldId, fieldObj.value)}
                className="px-3 py-1 bg-navy-900 hover:bg-navy-800 text-amber-300 text-xs font-bold rounded shadow-xs"
              >
                Save Correction & Audit Trace
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const totalRequiredChecklist = docConfig.checklistFields.length;
  const verifiedChecklistCount = docConfig.checklistFields.filter((f) => checklist[f.id]).length;

  return (
    <div className="space-y-4">
      {/* View Mode Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-300 p-2.5 rounded-md shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-navy-900" />
          <span className="font-bold text-navy-900 text-xs uppercase">
            AI EXTRACTION REVIEW WORKSPACE • {docConfig.titleEn}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded font-bold transition-all ${
              activeTab === 'split' ? 'bg-navy-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Split View (Desktop)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`px-3 py-1 rounded font-bold transition-all md:hidden ${
              activeTab === 'document' ? 'bg-navy-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Original Scan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`px-3 py-1 rounded font-bold transition-all md:hidden ${
              activeTab === 'fields' ? 'bg-navy-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Extracted Fields
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* LEFT PANEL: Document Viewer */}
        <div
          className={`md:col-span-6 ${
            activeTab === 'fields' ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="bg-white p-3 border border-slate-300 rounded-md shadow-sm space-y-2">
            <h4 className="font-bold text-navy-900 text-xs uppercase flex items-center justify-between">
              <span>ORIGINAL REVENUE SCAN PREVIEW</span>
              <span className="font-mono text-slate-500 font-normal">{uploadRecord.pageCount} Page(s)</span>
            </h4>
            <DocumentViewer originalFileName={uploadRecord.originalFileName} pageCount={uploadRecord.pageCount} />
          </div>
        </div>

        {/* RIGHT PANEL: Grouped Extracted Fields */}
        <div
          className={`md:col-span-6 space-y-3.5 ${
            activeTab === 'document' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Progress Header */}
          <div className="bg-navy-50 border border-navy-200 p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-navy-900" />
              <div>
                <span className="font-bold text-navy-900 text-xs block uppercase">
                  CATEGORY CHECKLIST PROGRESS
                </span>
                <span className="text-[11px] text-slate-600">
                  {verifiedChecklistCount} of {totalRequiredChecklist} mandatory checklist fields verified
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-navy-900 bg-white px-2 py-1 rounded border">
              {Math.round((verifiedChecklistCount / Math.max(1, totalRequiredChecklist)) * 100)}%
            </span>
          </div>

          {/* Grouped Field Cards Container */}
          <div className="space-y-4 max-h-[640px] overflow-auto pr-1">
            {/* Group 1: Owner Details */}
            <WorkspacePanel title="1. OWNER & GUARDIAN DETAILS">
              <div className="space-y-2.5">
                {renderFieldCard('ownerName', data.ownerName)}
                {renderFieldCard('fatherOrHusbandName', data.fatherOrHusbandName)}
              </div>
            </WorkspacePanel>

            {/* Group 2: Land Identification */}
            <WorkspacePanel title="2. LAND PARCEL IDENTIFICATION">
              <div className="space-y-2.5">
                {renderFieldCard('surveyNumber', data.surveyNumber)}
                {renderFieldCard('subDivisionNumber', data.subDivisionNumber)}
                {renderFieldCard('khataNumber', data.khataNumber)}
              </div>
            </WorkspacePanel>

            {/* Group 3: Land Area & Classification */}
            <WorkspacePanel title="3. LAND EXTENT & CLASSIFICATION">
              <div className="space-y-2.5">
                {renderFieldCard('extentAcres', data.extentAcres)}
                {renderFieldCard('landClassification', data.landClassification)}
              </div>
            </WorkspacePanel>

            {/* Group 4: Administrative Location */}
            <WorkspacePanel title="4. ADMINISTRATIVE JURISDICTION">
              <div className="space-y-2.5">
                {renderFieldCard('villageName', data.villageName)}
                {renderFieldCard('mandalName', data.mandalName)}
                {renderFieldCard('districtName', data.districtName)}
                {renderFieldCard('documentDate', data.documentDate)}
              </div>
            </WorkspacePanel>

            {/* Group 5: Boundaries */}
            <WorkspacePanel title="5. FOUR SIDE LAND BOUNDARIES (చతురస్ర పరిమితులు)">
              <div className="space-y-2.5">
                {renderFieldCard('boundaryEast', data.boundaries.east, 'East Boundary', 'తూర్పు సరిహద్దు')}
                {renderFieldCard('boundaryWest', data.boundaries.west, 'West Boundary', 'పశ్చిమ సరిహద్దు')}
                {renderFieldCard('boundaryNorth', data.boundaries.north, 'North Boundary', 'ఉత్తర సరిహద్దు')}
                {renderFieldCard('boundarySouth', data.boundaries.south, 'South Boundary', 'దక్షిణ సరిహద్దు')}
              </div>
            </WorkspacePanel>

            {/* Group 6: Repeatable Parties */}
            {data.parties && data.parties.value && data.parties.value.length > 0 && (
              <WorkspacePanel title={`6. PARTITION & INHERITANCE SHARES (${data.parties.value.length} PARTIES)`}>
                <div className="space-y-2">
                  {data.parties.value.map((party: PartyShare, pIdx: number) => (
                    <div key={pIdx} className="bg-slate-50 p-2.5 rounded border border-slate-300 text-xs space-y-1 font-mono">
                      <div className="font-bold text-navy-900">{party.name}</div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                        <div>Relationship: {party.relationship}</div>
                        <div>Share: {party.share}</div>
                        <div>Extent: {party.extent}</div>
                        <div>Survey: {party.surveyNumber || '142/3'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </WorkspacePanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
