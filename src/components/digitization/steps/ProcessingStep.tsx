'use client';

import React, { useEffect, useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { ShieldCheck, Cpu, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { DocumentUploadRecord } from '@/types/digitizationCase';
import { DocumentCategoryCode } from '@/config/digitizationSchemas';
import { OCRResult } from '@/lib/digitization/ocrProvider';
import { AIExtractionResult } from '@/lib/digitization/aiExtractionProvider';

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
  const [currentStage, setCurrentStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stages = [
    'Validating Document Structure & MIME Integrity',
    'Splitting Pages & Image Normalization',
    'Executing Multi-Lingual OCR (Telugu & English Provider)',
    'AI / NLP Land Schema Field Extraction & Boundary Analysis',
    'Mapping Source Evidence & Calculating Field Confidence Scores',
  ];

  useEffect(() => {
    let isMounted = true;

    const runPipeline = async () => {
      try {
        for (let i = 0; i < stages.length - 1; i++) {
          if (!isMounted) return;
          setCurrentStage(i);
          await new Promise((res) => setTimeout(res, 800));
        }

        if (!isMounted) return;
        setCurrentStage(4);

        // Call backend processing endpoint
        const res = await fetch('/api/digitization/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storageReference: uploadRecord.storageReference,
            documentType,
            fileSizeBytes: uploadRecord.fileSizeBytes,
            mimeType: uploadRecord.fileType,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Document processing failed.');
        }

        if (isMounted) {
          setTimeout(() => {
            onProcessingCompleted(data.ocrResult, data.aiResult);
          }, 600);
        }
      } catch (err: any) {
        console.error('Processing error:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Processing engine error occurred.');
        }
      }
    };

    runPipeline();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="PHASE 4 & 5: AI MULTI-LINGUAL OCR & DOCUMENT UNDERSTANDING"
        guidance="Assistive AI document extraction pipeline executing multi-lingual OCR and land record schema mapping."
      >
        <div className="py-8 max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-navy-900 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-md animate-pulse">
              <Cpu className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 uppercase tracking-wide">
              PROCESSING REVENUE RECORD
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              File: {uploadRecord.originalFileName} ({uploadRecord.pageCount} page(s))
            </p>
          </div>

          {/* Stages List */}
          <div className="space-y-3 bg-white p-5 rounded-md border border-slate-300 shadow-sm">
            {stages.map((stageLabel, idx) => {
              const isDone = currentStage > idx;
              const isCurrent = currentStage === idx;
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
                    {stageLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded text-xs text-red-800 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Processing Pipeline Interrupted</span>
              </div>
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded"
              >
                Retry Processing
              </button>
            </div>
          )}
        </div>
      </WorkspacePanel>
    </div>
  );
};
