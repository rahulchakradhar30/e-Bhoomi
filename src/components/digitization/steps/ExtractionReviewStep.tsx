'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode, StructuredLandRecordData, ExtractedField, PartyShare } from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult } from '@/lib/digitization/aiExtractionProvider';
import { FieldCorrectionAudit, VerificationChecklistState, DocumentUploadRecord } from '@/types/digitizationCase';
import { ShieldCheck, CheckCircle2, Edit3, Eye, FileText, AlertCircle, ArrowRight, CornerDownRight, CheckSquare, Info } from 'lucide-react';

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
  onBack: () => void;
}

export const ExtractionReviewStep: React.FC<ExtractionReviewStepProps> = ({
  documentType,
  uploadRecord,
  ocrResult,
  aiResult,
  initialCorrections = [],
  initialChecklist = {},
  onReviewCompleted,
  onBack,
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

    // Update corrections array
    setCorrections((prev) => [...prev.filter((c) => c.fieldId !== fieldId), auditEntry]);

    // Update field value in structured data state
    updateStructuredFieldValue(fieldId, editValue.trim());

    // Automatically check verification for edited field
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
          {pct}% AI CONFIDENCE
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
        {pct}% LOW CONFIDENCE (REQUIRES REVIEW)
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
        className={`p-3.5 rounded-md border transition-all ${
          correction
            ? 'bg-amber-50/60 border-amber-300'
            : isVerified
            ? 'bg-green-50/30 border-slate-300'
            : 'bg-white border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`chk-${fieldId}`}
              checked={isVerified}
              onChange={() => toggleChecklist(fieldId)}
              className="w-4 h-4 text-navy-800 rounded border-slate-300 focus:ring-navy-800 cursor-pointer"
            />
            <label htmlFor={`chk-${fieldId}`} className="cursor-pointer font-bold text-navy-900 text-xs">
              {customLabelEn || fieldObj.labelEn}
              <span className="font-serif font-bold text-amber-800 ml-1.5 text-[11px]">
                ({customLabelTe || fieldObj.labelTe})
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {getConfidenceBadge(fieldObj.confidence)}
            {!isEditing && (
              <button
                type="button"
                onClick={() => startEditField(fieldId, fieldObj.value)}
                className="p-1 hover:bg-slate-100 text-navy-800 rounded text-xs flex items-center gap-1 font-semibold border border-slate-200"
                title="Correct AI Value"
              >
                <Edit3 className="w-3 h-3 text-navy-700" />
                <span>Correct</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Value Display / Edit Form */}
        {!isEditing ? (
          <div className="space-y-1.5 pl-6">
            <div className="text-sm font-semibold text-slate-900 bg-white p-2 rounded border border-slate-200">
              {fieldObj.value || <span className="text-slate-400 italic">Not Available</span>}
            </div>

            {/* Source Evidence */}
            {fieldObj.evidence && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <CornerDownRight className="w-3 h-3 text-slate-400" />
                <span>Evidence (Page {fieldObj.evidence.sourcePage}):</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 italic">
                  "{fieldObj.evidence.sourceText}"
                </span>
              </div>
            )}

            {/* Correction Audit Trace */}
            {correction && (
              <div className="mt-2 p-2 bg-amber-100/70 border border-amber-300 rounded text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>VRO Correction Recorded:</span>
                </div>
                <div className="text-[11px] text-slate-800">
                  Original AI: <span className="line-through text-slate-500">{correction.originalAIValue}</span> →{' '}
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
          <div className="mt-2 pl-6 p-3 bg-amber-50 rounded border border-amber-400 space-y-3">
            <div className="font-bold text-navy-900 text-xs">VRO FIELD CORRECTION MODE</div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Corrected Field Value:</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border rounded border-slate-300 focus:ring-navy-800"
                placeholder="Enter corrected land record value..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Mandatory Correction Reason (Why AI value was incorrect):
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 text-xs border rounded border-slate-300 focus:ring-navy-800"
                placeholder="e.g. Spelling correction matching physical register volume page 24..."
              />
            </div>

            {editError && (
              <p className="text-[11px] font-bold text-red-700 bg-red-100 p-1.5 rounded">{editError}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => saveCorrection(fieldId, fieldObj.value)}
                className="px-3 py-1 bg-navy-900 hover:bg-navy-800 text-amber-300 text-xs font-bold rounded shadow-sm"
              >
                Save Correction & Audit Trace
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleProceedNext = () => {
    onReviewCompleted(data, corrections, checklist);
  };

  const totalRequiredChecklist = docConfig.checklistFields.length;
  const verifiedChecklistCount = docConfig.checklistFields.filter((f) => checklist[f.id]).length;

  return (
    <div className="space-y-6">
      {/* Mobile Responsive Layout Selector */}
      <div className="flex items-center justify-between bg-white border border-slate-300 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-navy-800" />
          <span className="font-bold text-navy-900 text-sm">
            AI EXTRACTION REVIEW WORKSPACE • {docConfig.titleEn}
          </span>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded font-bold transition-all ${
              activeTab === 'split' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Split View (Desktop)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`px-3 py-1 rounded font-bold transition-all md:hidden ${
              activeTab === 'document' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Original Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`px-3 py-1 rounded font-bold transition-all md:hidden ${
              activeTab === 'fields' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            AI Extracted Data
          </button>
        </div>
      </div>

      <WorkspacePanel
        title="PHASE 6 & 7: STRUCTURED DATA REVIEW & HUMAN-IN-THE-LOOP VERIFICATION"
        guidance="VRO Responsibility: Compare AI-extracted fields against original paper document. Verify checkboxes and record reasons for any corrected values."
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT PANEL: Document Viewer */}
          <div
            className={`md:col-span-6 ${
              activeTab === 'fields' ? 'hidden md:block' : 'block'
            }`}
          >
            <h4 className="font-bold text-navy-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>ORIGINAL DOCUMENT PREVIEW</span>
              <span className="font-mono text-slate-500 font-normal">
                {uploadRecord.pageCount} Page(s)
              </span>
            </h4>
            <DocumentViewer
              originalFileName={uploadRecord.originalFileName}
              pageCount={uploadRecord.pageCount}
            />
          </div>

          {/* RIGHT PANEL: Extracted Structured Data */}
          <div
            className={`md:col-span-6 space-y-4 ${
              activeTab === 'document' ? 'hidden md:block' : 'block'
            }`}
          >
            {/* Checklist Progress Header */}
            <div className="bg-navy-50 border border-navy-200 p-3 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-navy-800" />
                <div>
                  <span className="font-bold text-navy-900 text-xs block">
                    CATEGORY VERIFICATION CHECKLIST
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {verifiedChecklistCount} of {totalRequiredChecklist} mandatory category fields verified
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-navy-900">
                  {Math.round((verifiedChecklistCount / Math.max(1, totalRequiredChecklist)) * 100)}%
                </span>
              </div>
            </div>

            {/* Extracted Fields List */}
            <div className="space-y-3 max-h-[580px] overflow-auto pr-1">
              <div className="font-bold text-xs text-navy-900 uppercase border-b pb-1">
                Primary Land Ownership Details
              </div>

              {renderFieldCard('ownerName', data.ownerName)}
              {renderFieldCard('fatherOrHusbandName', data.fatherOrHusbandName)}
              {renderFieldCard('surveyNumber', data.surveyNumber)}
              {renderFieldCard('subDivisionNumber', data.subDivisionNumber)}
              {renderFieldCard('khataNumber', data.khataNumber)}
              {renderFieldCard('extentAcres', data.extentAcres)}
              {renderFieldCard('landClassification', data.landClassification)}

              <div className="font-bold text-xs text-navy-900 uppercase border-b pb-1 mt-4">
                Administrative Jurisdiction & Document Dates
              </div>

              {renderFieldCard('villageName', data.villageName)}
              {renderFieldCard('mandalName', data.mandalName)}
              {renderFieldCard('districtName', data.districtName)}
              {renderFieldCard('documentDate', data.documentDate)}

              <div className="font-bold text-xs text-navy-900 uppercase border-b pb-1 mt-4">
                Land Boundaries (చతురస్ర పరిమితులు)
              </div>

              {renderFieldCard('boundaryEast', data.boundaries.east, 'East Boundary', 'తూర్పు సరిహద్దు')}
              {renderFieldCard('boundaryWest', data.boundaries.west, 'West Boundary', 'పశ్చిమ సరిహద్దు')}
              {renderFieldCard('boundaryNorth', data.boundaries.north, 'North Boundary', 'ఉత్తర సరిహద్దు')}
              {renderFieldCard('boundarySouth', data.boundaries.south, 'South Boundary', 'దక్షిణ సరిహద్దు')}

              {/* Repeatable Parties / Partition Share Structure if present */}
              {data.parties && data.parties.value && data.parties.value.length > 0 && (
                <div className="mt-4 pt-2 border-t space-y-3">
                  <div className="font-bold text-xs text-navy-900 uppercase">
                    Inheritance Parties & Partition Shares ({data.parties.value.length} Parties)
                  </div>
                  <div className="bg-amber-50/80 border border-amber-300 p-3 rounded space-y-2">
                    {data.parties.value.map((party: PartyShare, pIdx: number) => (
                      <div key={pIdx} className="bg-white p-2.5 rounded border border-slate-300 text-xs space-y-1">
                        <div className="font-bold text-navy-900">{party.name}</div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                          <div>Relationship: {party.relationship}</div>
                          <div>Share: {party.share}</div>
                          <div>Extent: {party.extent}</div>
                          <div>Survey No: {party.surveyNumber || '142/3'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-navy-900 border border-slate-300 rounded hover:bg-slate-100"
          >
            ← Back to Upload
          </button>

          <button
            type="button"
            onClick={handleProceedNext}
            className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md shadow flex items-center gap-2"
          >
            <span>Proceed to Field Verification (Photo Capture)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </WorkspacePanel>
    </div>
  );
};
