'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import {
  SUPPORTED_DOCUMENT_TYPES,
  DocumentCategoryCode,
  StructuredLandRecordData,
  ExtractedField,
  PartyShare,
  DynamicCustomSection,
  DynamicCustomSectionField,
} from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult } from '@/lib/digitization/aiExtractionProvider';
import { FieldCorrectionAudit, VerificationChecklistState, DocumentUploadRecord } from '@/types/digitizationCase';
import { MasterDataResolver } from '@/lib/digitization/validation/masterDataResolver';
import {
  ShieldCheck,
  Edit3,
  CornerDownRight,
  CheckSquare,
  Info,
  AlertCircle,
  FileCheck,
  Building,
  MapPin,
  Check,
  Layers,
  Compass,
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

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');
  const [editReasonCode, setEditReasonCode] = useState<string>('OCR_ERROR');
  const [editError, setEditError] = useState<string | null>(null);

  const masterResolver = useMemo(() => new MasterDataResolver(), []);
  const valRes = (typeof window !== 'undefined' && (window as any).__LAST_VALIDATION_RESULT__) || null;
  const rawDistrict = (data.districtName?.value || '').trim();
  const distRes = useMemo(() => masterResolver.resolveDistrict(rawDistrict), [rawDistrict, masterResolver]);

  const isKurnoolDistrict =
    !rawDistrict ||
    ['unknown', 'not extracted', 'n/a', '', 'null'].includes(rawDistrict.toLowerCase()) ||
    distRes.matchedName?.toLowerCase() === 'kurnool' ||
    distRes.matchedCode === '545' ||
    distRes.matchedCode === '511' ||
    rawDistrict.toLowerCase().includes('kurnool') ||
    rawDistrict.includes('కర్నూలు') ||
    rawDistrict.includes('కర్నూల్');

  const isExplicitMismatch = rawDistrict.length > 2 && !isKurnoolDistrict;

  const isJurisdictionBlocked = Boolean(
    (valRes?.findings?.some(
      (f: any) => f.ruleId === 'JURISDICTION-DIST-001' && f.severity === 'CRITICAL'
    ) && !isKurnoolDistrict) || isExplicitMismatch
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
      originalAIValue: originalVal || '',
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
      else if (fieldId === 'documentDate') nextData.documentDate = { ...nextData.documentDate, value: newVal };
      else if (fieldId === 'registrationRef') nextData.registrationRef = nextData.registrationRef ? { ...nextData.registrationRef, value: newVal } : { fieldId: 'registrationRef', labelEn: 'Registration Ref', labelTe: 'రిజిస్ట్రేషన్ సంఖ్య', value: newVal, confidence: 0.9 };
      else if (fieldId === 'mutationRef') nextData.mutationRef = nextData.mutationRef ? { ...nextData.mutationRef, value: newVal } : { fieldId: 'mutationRef', labelEn: 'Mutation Ref', labelTe: 'మ్యూటేషన్ నడపడి', value: newVal, confidence: 0.9 };
      else if (fieldId === 'boundaryEast') nextData.boundaries.east = { ...nextData.boundaries.east, value: newVal };
      else if (fieldId === 'boundaryWest') nextData.boundaries.west = { ...nextData.boundaries.west, value: newVal };
      else if (fieldId === 'boundaryNorth') nextData.boundaries.north = { ...nextData.boundaries.north, value: newVal };
      else if (fieldId === 'boundarySouth') nextData.boundaries.south = { ...nextData.boundaries.south, value: newVal };

      return nextData;
    });
  };

  const getConfidenceBadge = (confidence?: number) => {
    const score = typeof confidence === 'number' ? confidence : 0;
    const pct = Math.round(score * 100);

    if (score <= 0) {
      return (
        <span className="digi-conf-pill digi-conf-null">
          0% (NOT EXTRACTED)
        </span>
      );
    } else if (pct >= 85) {
      return (
        <span className="digi-conf-pill digi-conf-high">
          {pct}% HIGH CONFIDENCE
        </span>
      );
    } else if (pct >= 60) {
      return (
        <span className="digi-conf-pill digi-conf-med">
          {pct}% MEDIUM CONFIDENCE
        </span>
      );
    }
    return (
      <span className="digi-conf-pill digi-conf-low">
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
    const val = fieldObj.value;

    return (
      <div
        key={fieldId}
        className={`digi-field-card ${isVerified ? 'is-verified' : ''} ${correction ? 'is-corrected' : ''}`}
      >
        <div className="digi-field-top">
          <div className="digi-field-label-group">
            <input
              type="checkbox"
              id={`chk-${fieldId}`}
              checked={isVerified}
              onChange={() => toggleChecklist(fieldId)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#0b2545' }}
            />
            <label htmlFor={`chk-${fieldId}`} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="digi-field-label-en">{customLabelEn || fieldObj.labelEn}</span>
              {(customLabelTe || fieldObj.labelTe) && (
                <span className="digi-field-label-te">
                  ({customLabelTe || fieldObj.labelTe})
                </span>
              )}
            </label>
          </div>

          <div className="digi-field-actions">
            {getConfidenceBadge(fieldObj.confidence)}
            {!isEditing && (
              <button
                type="button"
                onClick={() => startEditField(fieldId, val)}
                className="digi-btn-edit"
                title="Correct AI Extracted Value"
              >
                <Edit3 style={{ width: 12, height: 12 }} />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div>
            <div className="digi-field-val-box">
              {val ? (
                <span>{val}</span>
              ) : (
                <span className="digi-field-val-null">Not Extracted / Null</span>
              )}
            </div>

            {fieldObj.evidence && fieldObj.evidence.sourceText && (
              <div className="digi-evidence-box">
                <CornerDownRight style={{ width: 12, height: 12, color: '#94a3b8' }} />
                <span>Source (Page {fieldObj.evidence.sourcePage || 1}):</span>
                <span className="digi-evidence-text">
                  "{fieldObj.evidence.sourceText}"
                </span>
              </div>
            )}

            {correction && (
              <div style={{
                marginLeft: 24,
                marginTop: 6,
                padding: '6px 10px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 4,
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                color: '#92400e'
              }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Info style={{ width: 12, height: 12 }} /> VRO Correction Recorded:
                </div>
                <div>
                  AI: <span style={{ textDecoration: 'line-through', color: '#64748b' }}>{correction.originalAIValue || 'null'}</span> →{' '}
                  <strong style={{ color: '#0b2545' }}>{correction.correctedValue}</strong>
                </div>
                <div style={{ fontStyle: 'italic' }}>Reason: "{correction.correctionReason}"</div>
              </div>
            )}
          </div>
        ) : (
          <div className="digi-edit-box">
            <div className="digi-edit-title">VRO Field Correction Mode</div>

            <div>
              <label className="digi-edit-label">Corrected Value:</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="digi-edit-input"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label className="digi-edit-label">Correction Category:</label>
              <select
                value={editReasonCode}
                onChange={(e) => setEditReasonCode(e.target.value)}
                className="digi-edit-select"
              >
                <option value="OCR_ERROR">OCR Character Misread (OCR_ERROR)</option>
                <option value="HANDWRITING_MISREAD">Handwriting Scan Misread (HANDWRITING_MISREAD)</option>
                <option value="TRANSLATION_ERROR">Telugu-English Translation Shift (TRANSLATION_ERROR)</option>
                <option value="EXTRACTION_ERROR">NLP Entity Boundary Error (EXTRACTION_ERROR)</option>
                <option value="MASTER_DATA_MISMATCH">Master Data Hierarchy Discrepancy (MASTER_DATA_MISMATCH)</option>
                <option value="MANUAL_VERIFICATION">VRO Physical Scan Verification (MANUAL_VERIFICATION)</option>
                <option value="OTHER">Other Reason (OTHER)</option>
              </select>
            </div>

            <div>
              <label className="digi-edit-label">Explanation:</label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={2}
                className="digi-edit-textarea"
                placeholder="State official reason for correction..."
              />
            </div>

            {editError && (
              <p style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700, margin: 0 }}>
                {editError}
              </p>
            )}

            <div className="digi-edit-buttons">
              <button type="button" onClick={cancelEdit} className="digi-btn-cancel">
                Cancel
              </button>
              <button type="button" onClick={() => saveCorrection(fieldId, val)} className="digi-btn-save">
                Save Correction
              </button>
            </div>
          </div>
        )}
      </div>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isJurisdictionBlocked && (
        <div className="digi-alert-banner">
          <div className="digi-alert-icon-box">
            <AlertCircle style={{ width: 24, height: 24 }} />
          </div>
          <div className="digi-alert-content">
            <h4 className="digi-alert-title">
              JURISDICTION MISMATCH — CROSS-DISTRICT DIGITIZATION RESTRICTED
            </h4>
            <p className="digi-alert-desc">
              The uploaded document indicates district: <strong>{rawDistrict || 'Non-Kurnool Out-of-District'}</strong>.
              As a Village Revenue Officer authorized exclusively for <strong>Kurnool District</strong>, you cannot
              submit land records outside your assigned jurisdiction under the AP Land Revenue Act.
            </p>
          </div>
        </div>
      )}

      <div className="digi-header-banner">
        <div className="digi-header-left">
          <div className="digi-header-icon-box">
            <ShieldCheck style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h3 className="digi-header-title-en">
              CUSTOM DIGITIZATION WORKSPACE • {displayDocTitleEn}
            </h3>
            <p className="digi-header-title-te">{displayDocTitleTe}</p>
          </div>
        </div>

        <div className="digi-view-toggle-group">
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`digi-view-btn ${activeTab === 'split' ? 'is-active' : ''}`}
          >
            Split View (Desktop)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`digi-view-btn ${activeTab === 'document' ? 'is-active' : ''}`}
          >
            Scan Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`digi-view-btn ${activeTab === 'fields' ? 'is-active' : ''}`}
          >
            Extracted Fields
          </button>
        </div>
      </div>

      <div className="digi-workspace-grid">
        <div className="digi-left-pane" style={{ display: activeTab === 'fields' ? 'none' : 'flex' }}>
          <div className="digi-viewer-card">
            <div className="digi-viewer-header">
              <span className="digi-viewer-title">ORIGINAL REVENUE SCAN PREVIEW</span>
              <span className="digi-viewer-pages">{uploadRecord.pageCount} Page(s)</span>
            </div>
            <div style={{ padding: 12 }}>
              <DocumentViewer
                originalFileName={uploadRecord.originalFileName}
                pageCount={uploadRecord.pageCount}
              />
            </div>
          </div>
        </div>

        <div className="digi-right-pane" style={{ display: activeTab === 'document' ? 'none' : 'flex' }}>
          <div className="digi-checklist-card">
            <div className="digi-progress-header">
              <div className="digi-progress-left">
                <FileCheck style={{ width: 20, height: 20, color: '#0b2545' }} />
                <div>
                  <div className="digi-progress-title">
                    DOCUMENT VERIFICATION CHECKLIST ({verifiedChecklistCount}/{totalRequiredChecklist})
                  </div>
                  <div className="digi-progress-count">
                    {verifiedChecklistCount >= totalRequiredChecklist
                      ? 'All mandatory document checklist items verified by VRO'
                      : `${totalRequiredChecklist - verifiedChecklistCount} verification items pending approval`}
                  </div>
                </div>
              </div>
              <span className="digi-progress-pct">
                {Math.round((verifiedChecklistCount / Math.max(1, totalRequiredChecklist)) * 100)}%
              </span>
            </div>

            <div className="digi-checklist-list">
              {activeChecklistItems.map((item) => {
                const isChecked = !!checklist[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`digi-checklist-row ${isChecked ? 'is-checked' : ''}`}
                  >
                    <label className="digi-check-label" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChecklist(item.id)}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#0b2545' }}
                      />
                      <span>
                        <strong>{item.labelEn}</strong>
                        {item.labelTe && (
                          <span style={{ color: '#b45309', fontFamily: 'serif', marginLeft: 6, fontSize: '0.75rem' }}>
                            ({item.labelTe})
                          </span>
                        )}
                      </span>
                    </label>
                    <div>{getConfidenceBadge(item.confidence)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <WorkspacePanel
            title={
              documentType === 'ROR_1B'
                ? '1. ROR KHATA & PATTADAR IDENTIFIERS'
                : documentType === 'MUTATION'
                ? '1. MUTATION PROCEEDING & NEW OWNER (TRANSFEREE)'
                : documentType === 'PASSBOOK'
                ? '1. PATTADAR PASSBOOK & OWNER DETAILS'
                : documentType === 'PARTITION'
                ? '1. ANCESTRAL PATTADAR & PROCEEDING RECORD'
                : '1. POSSESSION & CULTIVATOR DETAILS'
            }
          >
            {renderFieldCard('ownerName', data.ownerName, documentType === 'MUTATION' ? 'New Pattadar (Transferee)' : 'Pattadar / Owner Name', 'పట్టాదారు పేరు')}
            {renderFieldCard('fatherOrHusbandName', data.fatherOrHusbandName, 'Father / Husband Name', 'తండ్రి / భర్త పేరు')}
            {documentType === 'ROR_1B' && renderFieldCard('khataNumber', data.khataNumber, 'Khata Number', 'ఖాతా నంబరు')}
            {documentType === 'MUTATION' && renderFieldCard('mutationRef', data.mutationRef, 'Mutation Proceeding Ref', 'మ్యూటేషన్ నడపడి సంఖ్య')}
            {documentType === 'PASSBOOK' && renderFieldCard('registrationRef', data.registrationRef, 'Passbook / Title Deed No', 'పాస్‌బుక్ నంబరు')}
          </WorkspacePanel>

          <WorkspacePanel
            title={
              documentType === 'ROR_1B'
                ? '2. ROR SURVEY PARCEL SCHEDULE'
                : documentType === 'MUTATION'
                ? '2. MUTATED SURVEY PARCEL & EXTENT'
                : documentType === 'PASSBOOK'
                ? '2. PASSBOOK LAND SCHEDULE'
                : '2. LAND PARCEL & EXTENT IDENTIFICATION'
            }
          >
            {renderFieldCard('surveyNumber', data.surveyNumber, 'Survey Number', 'సర్వే నంబరు')}
            {renderFieldCard('subDivisionNumber', data.subDivisionNumber, 'Sub-Division Number', 'సబ్‌డివిజన్ నంబరు')}
            {documentType !== 'ROR_1B' && renderFieldCard('khataNumber', data.khataNumber, 'Khata Number', 'ఖాతా నంబరు')}
            {renderFieldCard('extentAcres', data.extentAcres, 'Extent (Acres.Cents)', 'విస్తీర్ణం (ఎకరాలు.సెంట్లు)')}
            {renderFieldCard('landClassification', data.landClassification, 'Land Classification / Nature', 'భూమి వర్గీకరణ')}
          </WorkspacePanel>

          <WorkspacePanel title="3. ADMINISTRATIVE JURISDICTION & RECORD DATE">
            {renderFieldCard('villageName', data.villageName, 'Village Name', 'గ్రామం పేరు')}
            {renderFieldCard('mandalName', data.mandalName, 'Mandal Name', 'మండలం పేరు')}
            {renderFieldCard('revenueDivision', data.revenueDivision, 'Revenue Division', 'రెవెన్యూ డివిజన్')}
            {renderFieldCard('districtName', data.districtName, 'District Name', 'జిల్లా పేరు')}
            {renderFieldCard('documentDate', data.documentDate, 'Record / Proceeding Date', 'రికార్డు / ప్రొసీడింగ్ తేదీ')}
          </WorkspacePanel>

          {(documentType === 'ADANGAL' ||
            documentType === 'PASSBOOK' ||
            documentType === 'PARTITION' ||
            data.boundaries.east?.value ||
            data.boundaries.north?.value) && (
            <WorkspacePanel title="4. FOUR SIDE LAND BOUNDARIES (చతురస్ర పరిమితులు)">
              {renderFieldCard('boundaryEast', data.boundaries.east, 'East Boundary', 'తూర్పు సరిహద్దు')}
              {renderFieldCard('boundaryWest', data.boundaries.west, 'West Boundary', 'పశ్చిమ సరిహద్దు')}
              {renderFieldCard('boundaryNorth', data.boundaries.north, 'North Boundary', 'ఉత్తర సరిహద్దు')}
              {renderFieldCard('boundarySouth', data.boundaries.south, 'South Boundary', 'దక్షిణ సరిహద్దు')}
            </WorkspacePanel>
          )}

          {data.parties && data.parties.value && data.parties.value.length > 0 && (
            <WorkspacePanel title={`5. PARTITION & INHERITANCE SHARES (${data.parties.value.length} HEIR PARTIES)`}>
              {data.parties.value.map((party: PartyShare, pIdx: number) => (
                <div
                  key={pIdx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '10px 14px',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#0b2545', marginBottom: 4 }}>{party.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, color: '#475569', fontSize: '0.75rem' }}>
                    <div>Relationship: {party.relationship}</div>
                    <div>Share: {party.share}</div>
                    <div>Extent: {party.extent}</div>
                    <div>Survey: {party.surveyNumber || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </WorkspacePanel>
          )}
        </div>
      </div>
    </div>
  );
};
