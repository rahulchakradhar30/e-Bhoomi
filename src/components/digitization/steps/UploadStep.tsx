'use client';

import React, { useEffect, useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { SUPPORTED_DOCUMENT_TYPES, DocumentCategoryCode } from '@/config/digitizationSchemas';
import { FileUp, FileText, CheckCircle2, AlertCircle, Trash2, UploadCloud } from 'lucide-react';
import { DocumentUploadRecord } from '@/types/digitizationCase';

interface UploadStepProps {
  documentType: DocumentCategoryCode;
  initialUpload?: DocumentUploadRecord;
  onUploadCompleted: (uploadRecord: DocumentUploadRecord) => void;
  onValidityChange?: (isValid: boolean) => void;
  onBack?: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  documentType,
  initialUpload,
  onUploadCompleted,
  onValidityChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadRecord, setUploadRecord] = useState<DocumentUploadRecord | null>(initialUpload || null);

  const docConfig = SUPPORTED_DOCUMENT_TYPES.find((d) => d.code === documentType) || SUPPORTED_DOCUMENT_TYPES[0];

  useEffect(() => {
    onValidityChange?.(!!uploadRecord);
  }, [uploadRecord]);

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
    setUploadProgress(30);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);

      setUploadProgress(70);

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
    onValidityChange?.(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Category Banner */}
      <div className="bg-navy-900 text-white p-3.5 rounded-md shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-amber-300" />
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400">Target Document Category:</span>
            <h4 className="text-sm font-bold">
              {docConfig.titleEn} • <span className="font-serif text-amber-300">{docConfig.titleTe}</span>
            </h4>
          </div>
        </div>
        <span className="bg-navy-800 text-slate-200 text-xs px-2.5 py-1 rounded font-mono border border-navy-700">
          {docConfig.code}
        </span>
      </div>

      <WorkspacePanel
        title="DOCUMENT SCAN FILE UPLOAD"
        guidance="Preferred format: Multi-page PDF for complete register preservation. High-resolution JPG/JPEG/PNG scans (min 300 DPI) are also supported."
      >
        {!uploadRecord ? (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                selectedFile ? 'border-navy-800 bg-navy-50/40' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
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
                <label htmlFor="doc-file-input" className="cursor-pointer block space-y-2.5">
                  <div className="w-12 h-12 bg-navy-900 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide">
                      Click to Select or Drag & Drop Physical Scan File
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF Preferred (Preserves multi-page revenue record order) • Max Size: 25MB
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-600 font-mono">
                      <span className="bg-slate-200 px-2 py-0.5 rounded">PDF</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded">JPG</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded">JPEG</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded">PNG</span>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex items-center justify-between p-3 bg-white border border-navy-800/40 rounded-md">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-6 h-6 text-navy-800 flex-shrink-0" />
                      <div className="text-left truncate">
                        <p className="font-bold text-navy-900 text-xs truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="p-1 hover:bg-slate-100 text-red-600 rounded ml-2"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {uploading && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-navy-900 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-navy-900 font-bold text-right">
                        Encrypting & Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {!uploading && (
                    <button
                      type="button"
                      onClick={handleUploadSubmit}
                      className="w-full py-2 bg-navy-900 hover:bg-navy-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md shadow-md flex items-center justify-center gap-2"
                    >
                      <FileUp className="w-4 h-4" />
                      <span>Upload & Process Document</span>
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
          /* Upload Success Box */
          <div className="bg-amber-50/70 border border-amber-300 p-4 rounded-md space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-700 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-navy-900 text-xs uppercase">
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
                <span className="text-slate-400 block text-[10px]">FILE SIZE:</span>
                <span className="font-bold text-navy-900">
                  {(uploadRecord.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            <div className="pt-1 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-700 font-semibold underline hover:text-red-900"
              >
                Re-upload Different Document
              </button>
              <span className="font-mono text-slate-500 font-semibold">Ready for Processing</span>
            </div>
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
};
