'use client';

import React, { useEffect, useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { DocumentUploadRecord } from '@/types/digitizationCase';
import {
  DocumentProcessingJob,
  NormalizedDocumentRepresentation,
  DocumentQualityDiagnostic,
} from '@/types/documentProcessingJob';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Eye,
  Layers,
  MapPin,
  Table,
  Info,
} from 'lucide-react';
import { DocumentViewer } from '@/components/documents/DocumentViewer';

interface ProcessingPipelineWorkspaceProps {
  uploadRecord: DocumentUploadRecord;
  vroSelectedDocumentType: DocumentCategoryCode;
  onPipelineCompleted: (normalizedDoc: NormalizedDocumentRepresentation) => void;
  onRetryUpload: () => void;
}

export const ProcessingPipelineWorkspace: React.FC<ProcessingPipelineWorkspaceProps> = ({
  uploadRecord,
  vroSelectedDocumentType,
  onPipelineCompleted,
  onRetryUpload,
}) => {
  const [job, setJob] = useState<DocumentProcessingJob | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const stages = [
    'Initializing Processing Job & Image Pre-processing',
    'Executing Automated Multi-Signal Document Classification',
    'Running Advanced Multi-Lingual OCR (Telugu & English)',
    'Executing Computer Vision, Table & Cadastral Map Region Detection',
    'Generating Normalized Document Intelligence Package (Ready for AI Extraction)',
  ];

  const executePipeline = async () => {
    setErrorMsg(null);
    setCurrentStageIndex(0);

    try {
      // 1. Create Job
      const createRes = await fetch('/api/digitization/pipeline/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadRecord, vroSelectedDocumentType }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) throw new Error(createData.error || 'Failed to create job');

      let currentJob: DocumentProcessingJob = createData.job;
      setJob(currentJob);
      setCurrentStageIndex(1);

      // 2. Preprocess
      const prepRes = await fetch('/api/digitization/pipeline/preprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceFile: uploadRecord }),
      });
      const prepData = await prepRes.json();
      if (!prepRes.ok || !prepData.success) throw new Error(prepData.error || 'Preprocessing failed');

      currentJob = { ...currentJob, preprocessedPages: prepData.preprocessedPages, preprocessingStatus: 'COMPLETED' };
      setJob(currentJob);
      setCurrentStageIndex(2);

      // 3. OCR
      const ocrRes = await fetch('/api/digitization/pipeline/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceFile: uploadRecord }),
      });
      const ocrData = await ocrRes.json();
      if (!ocrRes.ok || !ocrData.success) throw new Error(ocrData.error || 'OCR failed');

      currentJob = { ...currentJob, ocrResult: ocrData.ocrResult, ocrStatus: 'COMPLETED' };
      setJob(currentJob);
      setCurrentStageIndex(3);

      // 4. Classify
      const classifyRes = await fetch('/api/digitization/pipeline/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullText: ocrData.ocrResult.extractedText,
          vroSelectedDocumentType,
          pageCount: uploadRecord.pageCount,
        }),
      });
      const classifyData = await classifyRes.json();
      if (!classifyRes.ok || !classifyData.success) throw new Error(classifyData.error || 'Classification failed');

      currentJob = {
        ...currentJob,
        classificationResult: classifyData.classificationResult,
        detectedDocumentType: classifyData.detectedDocumentType,
        classificationMismatch: classifyData.classificationMismatch,
        classificationStatus: 'COMPLETED',
      };
      setJob(currentJob);
      setCurrentStageIndex(4);

      // 5. Vision Analysis & Normalized Representation
      const visionRes = await fetch('/api/digitization/pipeline/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: currentJob.processingId,
          vroSelectedDocumentType,
          detectedDocumentType: classifyData.detectedDocumentType,
          isMismatch: classifyData.classificationMismatch,
          sourceFile: uploadRecord,
          preprocessedPages: prepData.preprocessedPages,
          classificationResult: classifyData.classificationResult,
          ocrResult: ocrData.ocrResult,
        }),
      });
      const visionData = await visionRes.json();
      if (!visionRes.ok || !visionData.success) throw new Error(visionData.error || 'Vision analysis failed');

      currentJob = {
        ...currentJob,
        visionResult: visionData.visionResult,
        documentQuality: visionData.documentQuality,
        normalizedRepresentation: visionData.normalizedRepresentation,
        visionStatus: 'COMPLETED',
        overallStatus: 'READY_FOR_AI_EXTRACTION',
      };
      setJob(currentJob);
      setCurrentStageIndex(5);
    } catch (err: any) {
      console.error('Pipeline execution error:', err);
      setErrorMsg(err.message || 'Pipeline processing failed');
    }
  };

  useEffect(() => {
    executePipeline();
  }, []);

  const norm = job?.normalizedRepresentation;
  const qual = job?.documentQuality;
  const classRes = job?.classificationResult;

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="PHASE 1: UNIFIED DOCUMENT INTELLIGENCE FOUNDATION PIPELINE"
        guidance="Pre-processing, Multi-Signal Classification, Telugu/English OCR, and Computer Vision analysis pipeline."
      >
        <div className="space-y-6">
          {/* Header Progress & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900 text-white p-4 rounded-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-navy-800 text-amber-300 rounded-md border border-navy-700">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                  PIPELINE JOB REF: {job?.processingId || 'INITIALIZING'}
                </span>
                <h3 className="text-base font-bold uppercase">
                  DOCUMENT INTELLIGENCE FOUNDATION ENGINE
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-amber-300 text-xs font-bold rounded border border-navy-600 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showPreview ? 'Hide Document Preview' : 'Preview Original Scan'}</span>
              </button>

              <button
                type="button"
                onClick={executePipeline}
                className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold rounded border border-navy-600 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Pipeline</span>
              </button>
            </div>
          </div>

          {showPreview && (
            <div className="border border-navy-800 rounded-md p-2 bg-slate-100">
              <DocumentViewer originalFileName={uploadRecord.originalFileName} pageCount={uploadRecord.pageCount} />
            </div>
          )}

          {/* Classification Mismatch Warning Banner */}
          {job?.classificationMismatch && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded-md shadow-sm flex items-start gap-3 text-xs text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  CLASSIFICATION MISMATCH DETECTED (NON-DESTRUCTIVE WARNING)
                </p>
                <p>
                  VRO Selected Category: <span className="font-mono font-bold text-navy-900">{vroSelectedDocumentType}</span> • AI Detected Category: <span className="font-mono font-bold text-navy-900">{job.detectedDocumentType}</span> ({Math.round((classRes?.confidenceScore || 0.9) * 100)}% confidence).
                </p>
                <p className="text-[11px] text-amber-800 italic">
                  Note: The system preserves the VRO's selected category and retains detected signals for downstream human verification in future phases.
                </p>
              </div>
            </div>
          )}

          {/* Stage Progress Box */}
          <div className="bg-white p-5 rounded-md border border-slate-300 space-y-3 shadow-sm">
            <h4 className="font-bold text-navy-900 text-xs uppercase border-b pb-1.5 flex items-center justify-between">
              <span>FOUNDATION PIPELINE STAGES</span>
              <span className="font-mono text-slate-500 font-normal">
                Stage {Math.min(5, currentStageIndex)} of 5
              </span>
            </h4>

            <div className="space-y-2.5">
              {stages.map((label, idx) => {
                const isDone = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx + 1 && job?.overallStatus !== 'READY_FOR_AI_EXTRACTION';
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-navy-800 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-mono flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span
                      className={`${
                        isDone
                          ? 'text-slate-700 font-medium'
                          : isCurrent
                          ? 'text-navy-900 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnostic & Summary Cards Grid */}
          {job?.overallStatus === 'READY_FOR_AI_EXTRACTION' && (
            <div className="space-y-6">
              {/* Document Quality Warnings */}
              {qual && qual.qualityWarnings && qual.qualityWarnings.length > 0 && (
                <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-md space-y-2 text-xs text-blue-900">
                  <h4 className="font-bold uppercase flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-700" />
                    <span>COMPUTER VISION QUALITY DIAGNOSTIC WARNINGS</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-950 font-mono">
                    {qual.qualityWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Normalized Processing Summary Card */}
              <div className="bg-slate-50 border border-slate-300 p-5 rounded-md space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-700" />
                    <h4 className="font-bold text-navy-900 text-sm uppercase">
                      NORMALIZED DOCUMENT INTELLIGENCE SUMMARY
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded font-mono font-bold text-xs">
                    STATUS: READY_FOR_AI_EXTRACTION
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">FILE & PAGES:</span>
                    <span className="font-bold text-navy-900 truncate block">{uploadRecord.originalFileName}</span>
                    <span className="text-slate-600">{uploadRecord.pageCount} Page(s) Preserved</span>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">CLASSIFICATION:</span>
                    <span className="font-bold text-navy-900 block">{job.detectedDocumentType}</span>
                    <span className="text-slate-600">Confidence: {Math.round((classRes?.confidenceScore || 0.9) * 100)}%</span>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">OCR ENGINE:</span>
                    <span className="font-bold text-navy-900 block">Telugu + English</span>
                    <span className="text-slate-600">Language: {job.ocrResult?.detectedLanguage}</span>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">SCHEMA VERSION:</span>
                    <span className="font-bold text-navy-900 block">{norm?.selectedSchemaVersion || 'v1.0'}</span>
                    <span className="text-slate-600">Registry: Active</span>
                  </div>
                </div>

                {/* Detected Vision Structures Summary */}
                <div className="bg-white p-3 rounded border border-slate-200 space-y-2 text-xs font-mono">
                  <span className="font-bold text-navy-900 block uppercase">
                    Detected Visual Regions & Tables
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 flex items-center gap-1">
                      <Table className="w-3 h-3 text-navy-700" />
                      <span>{job.visionResult?.detectedTables?.length || 0} Land Schedule Table(s)</span>
                    </span>
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-navy-700" />
                      <span>{job.visionResult?.detectedRegions?.filter((r) => r.regionType === 'MAP_REGION').length || 0} Cadastral Map Region(s)</span>
                    </span>
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-navy-700" />
                      <span>{job.visionResult?.detectedRegions?.length || 0} Vision Regions Detected</span>
                    </span>
                  </div>
                </div>

                {/* Final Proceed Action */}
                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => norm && onPipelineCompleted(norm)}
                    className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md shadow-md flex items-center gap-2"
                  >
                    <span>Proceed to AI Extraction Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded text-xs text-red-800 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Processing Pipeline Error</span>
              </div>
              <p>{errorMsg}</p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={executePipeline}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded"
                >
                  Retry Pipeline Processing
                </button>
                <button
                  type="button"
                  onClick={onRetryUpload}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded"
                >
                  Re-upload Document
                </button>
              </div>
            </div>
          )}
        </div>
      </WorkspacePanel>
    </div>
  );
};
