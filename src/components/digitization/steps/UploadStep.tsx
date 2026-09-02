'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode } from '@/config/digitizationSchemas';
import { FileUp, FileText, CheckCircle2, AlertCircle, Trash2, ArrowRight, UploadCloud } from 'lucide-react';
import { DocumentUploadRecord } from '@/types/digitizationCase';

interface UploadStepProps {
  documentType: DocumentCategoryCode;
  initialUpload?: DocumentUploadRecord;
  onUploadCompleted: (uploadRecord: DocumentUploadRecord) => void;
  onBack: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  documentType,
  initialUpload,
  onUploadCompleted,
  onBack,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadRecord, setUploadRecord] = useState<DocumentUploadRecord | null>(initialUpload || null);

  const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === documentType) || SUPPORTED_DOCUMENT_TYPES[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Invalid file format. Please upload a PDF or high-resolution scan (JPG, JPEG, PNG).');
      return;
    }
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('File size exceeds the 25MB maximum limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(20);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);

      setUploadProgress(60);

      const res = await fetch('/api/digitization/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setUploadProgress(100);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      const rec: DocumentUploadRecord = {
        originalFileName: data.originalFileName,
        fileType: data.fileType,
        fileSizeBytes: data.fileSizeBytes,
        pageCount: data.pageCount,
        storageReference: data.storageReference,
        uploadedAt: data.uploadedAt,
        uploadedByOfficerId: 'AP-545-VRO-00101',
      };

      setUploadRecord(rec);
      setUploading(false);
      onUploadCompleted(rec);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Upload server error. Please try again.');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadRecord(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Header Banner */}
      <div className="bg-navy-900 text-white p-4 rounded-md shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
            Selected Document Category
          </span>
          <h3 className="text-lg font-bold">
            {docConfig.titleEn} • <span className="font-serif text-amber-300">{docConfig.titleTe}</span>
          </h3>
        </div>
        <div className="bg-navy-800 text-slate-200 text-xs px-3 py-1.5 rounded border border-navy-700 font-mono">
          Code: {docConfig.code}
        </div>
      </div>

      <WorkspacePanel
        title="PHASE 3: SECURE PHYSICAL DOCUMENT SCAN UPLOAD"
        guidance="Preferred format: Multi-page PDF for complete register preservation. High-resolution JPG/JPEG/PNG scans are also supported."
      >
        {/* Upload Container */}
        {!uploadRecord ? (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                selectedFile ? 'border-navy-800 bg-navy-50/40' : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/60'
              }`}
            >
              <input
                type="file"
                id="doc-file-input"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <label htmlFor="doc-file-input" className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 bg-navy-900 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide">
                      Click to Select or Drag & Drop Physical Scan File
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF Preferred (Preserves multi-page revenue record order) • Max File Size: 25MB
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-600">
                      <span className="bg-slate-200 px-2 py-0.5 rounded font-mono">PDF</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded font-mono">JPG</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded font-mono">JPEG</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded font-mono">PNG</span>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 p-3 bg-white border border-navy-700/40 rounded-md max-w-md mx-auto">
                    <FileText className="w-8 h-8 text-navy-800" />
                    <div className="text-left truncate">
                      <p className="font-bold text-navy-900 text-xs truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="p-1 hover:bg-slate-100 rounded text-red-600 ml-auto"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {uploading && (
                    <div className="max-w-md mx-auto space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-navy-900 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] font-mono text-navy-900 font-bold text-right">
                        Encrypting & Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {!uploading && (
                    <button
                      type="button"
                      onClick={handleUploadSubmit}
                      className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md shadow-md flex items-center gap-2 mx-auto"
                    >
                      <FileUp className="w-4 h-4" />
                      <span>Upload & Initialize OCR Pipeline</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        ) : (
          /* Upload Success Display */
          <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-md space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-700" />
              <div>
                <h4 className="font-bold text-navy-900 text-sm uppercase">
                  DOCUMENT SECURELY ATTACHED & VALIDATED
                </h4>
                <p className="text-xs text-slate-600">
                  Original paper record scan stored with cryptographic metadata reference.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">FILE NAME:</span>
                <span className="font-bold text-navy-900 truncate block">{uploadRecord.originalFileName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PAGE COUNT:</span>
                <span className="font-bold text-navy-900">{uploadRecord.pageCount} Page(s)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SIZE:</span>
                <span className="font-bold text-navy-900">
                  {(uploadRecord.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-red-700 font-semibold underline hover:text-red-900"
              >
                Re-upload Different Document
              </button>

              <button
                type="button"
                onClick={() => onUploadCompleted(uploadRecord)}
                className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md shadow flex items-center gap-2"
              >
                <span>Proceed to OCR & AI Extraction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-navy-900 border border-slate-300 rounded hover:bg-slate-100"
          >
            ← Back to Category Selection
          </button>
        </div>
      </WorkspacePanel>
    </div>
  );
};
