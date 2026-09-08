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

      const localBlobUrl = selectedFile ? URL.createObjectURL(selectedFile) : '';
      const rec: DocumentUploadRecord = {
        originalFileName: data.originalFileName,
        fileType: data.fileType,
        fileSizeBytes: data.fileSizeBytes,
        pageCount: data.pageCount,
        storageReference: data.storageReference,
        uploadedAt: data.uploadedAt,
        uploadedByOfficerId: 'AP-545-VRO-00101',
        documentUrl: data.documentUrl || localBlobUrl,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Category Banner */}
      <div className="digi-upload-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText className="w-6 h-6 text-amber-300" />
          <div>
            <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#fbbf24', display: 'block' }}>
              Target Document Category:
            </span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>
              {docConfig.titleEn} • <span style={{ fontFamily: "'Noto Sans Telugu', serif", color: '#fbbf24' }}>{docConfig.titleTe}</span>
            </h4>
          </div>
        </div>
        <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#e2e8f0', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.2)' }}>
          {docConfig.code}
        </span>
      </div>

      <WorkspacePanel
        title="DOCUMENT SCAN FILE UPLOAD"
        guidance="Preferred format: Multi-page PDF for complete register preservation. High-resolution JPG/JPEG/PNG scans (min 300 DPI) are also supported."
      >
        {!uploadRecord ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={`digi-upload-zone ${selectedFile ? 'has-file' : ''}`}>
              <input
                type="file"
                id="doc-file-input"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!selectedFile ? (
                <label htmlFor="doc-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div className="digi-upload-icon-circle">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="digi-upload-title">
                      Click to Select or Drag & Drop Physical Scan File
                    </h4>
                    <p className="digi-upload-sub">
                      PDF Preferred (Preserves multi-page revenue record order) • Max Size: 25MB
                    </p>
                    <div className="digi-upload-pills" style={{ justifyContent: 'center' }}>
                      <span className="digi-upload-pill">PDF</span>
                      <span className="digi-upload-pill">JPG</span>
                      <span className="digi-upload-pill">JPEG</span>
                      <span className="digi-upload-pill">PNG</span>
                    </div>
                  </div>
                </label>
              ) : (
                <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <FileText className="w-6 h-6 text-navy-900" style={{ flexShrink: 0 }} />
                      <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                        <p style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0b2545', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selectedFile.name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', margin: 0 }}>
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemove}
                      style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {uploading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                        <div
                          style={{ background: '#0b2545', height: '8px', borderRadius: '9999px', width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}
                        />
                      </div>
                      <p style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#0b2545', fontWeight: 800, textAlign: 'right', margin: 0 }}>
                        Encrypting & Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {!uploading && (
                    <button
                      type="button"
                      onClick={handleUploadSubmit}
                      className="digi-btn-proceed"
                      style={{ justifyContent: 'center', width: '100%' }}
                    >
                      <FileUp className="w-4 h-4" />
                      <span>Upload & Process Document</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="digi-proc-error-box">
                <div className="digi-proc-error-title">
                  <AlertCircle className="w-4 h-4" />
                  <span>Upload Error</span>
                </div>
                <p className="digi-proc-error-msg">{errorMsg}</p>
              </div>
            )}
          </div>
        ) : (
          /* Upload Success Box */
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 className="w-6 h-6 text-green-700" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#14532d', textTransform: 'uppercase', margin: 0 }}>
                  DOCUMENT SECURELY ATTACHED & VALIDATED
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#166534', margin: '2px 0 0 0' }}>
                  Original paper record scan stored with cryptographic metadata reference.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>FILE NAME:</span>
                <span style={{ fontWeight: 800, color: '#0b2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{uploadRecord.originalFileName}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>PAGE COUNT:</span>
                <span style={{ fontWeight: 800, color: '#0b2545' }}>{uploadRecord.pageCount} Page(s)</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>FILE SIZE:</span>
                <span style={{ fontWeight: 800, color: '#0b2545' }}>
                  {(uploadRecord.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={handleRemove}
                style={{ color: '#dc2626', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Re-upload Different Document
              </button>
              <span style={{ fontFamily: 'monospace', color: '#166534', fontWeight: 800 }}>Ready for Processing</span>
            </div>
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
};
