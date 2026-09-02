'use client';

import React, { useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { FieldVerificationRecord, FieldVerificationPhoto } from '@/types/digitizationCase';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, ArrowRight, Upload } from 'lucide-react';

interface FieldVerificationStepProps {
  initialVerification?: FieldVerificationRecord;
  onVerificationCompleted: (fieldRecord: FieldVerificationRecord) => void;
  onBack: () => void;
}

export const FieldVerificationStep: React.FC<FieldVerificationStepProps> = ({
  initialVerification,
  onVerificationCompleted,
  onBack,
}) => {
  const [photos, setPhotos] = useState<FieldVerificationPhoto[]>(initialVerification?.photos || []);
  const [notes, setNotes] = useState<string>(initialVerification?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const minRequiredPhotos = 4;
  const isComplete = photos.length >= minRequiredPhotos;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newPhotos: FieldVerificationPhoto[] = [];

    files.forEach((file, idx) => {
      const pId = `PHOTO-${Date.now()}-${idx}`;
      newPhotos.push({
        photoId: pId,
        fileName: file.name,
        storageReference: `secure://ebhoomi-field-photos/${pId}/${file.name}`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'AP-545-VRO-00101',
        caption: `Field Inspection Photograph #${photos.length + idx + 1}`,
      });
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.photoId !== photoId));
  };

  const handleProceed = () => {
    if (!isComplete) {
      setErrorMsg(`Mandatory requirement: At least ${minRequiredPhotos} field inspection photographs must be uploaded.`);
      return;
    }

    const fieldRecord: FieldVerificationRecord = {
      photos,
      status: 'VERIFIED',
      notes: notes.trim(),
      verifiedByOfficerId: 'AP-545-VRO-00101',
      verifiedAt: new Date().toISOString(),
    };

    onVerificationCompleted(fieldRecord);
  };

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="PHASE 9: MANDATORY FIELD VERIFICATION & LOCATION PHOTOGRAPHS"
        guidance="VRO Field Verification Duty: Perform physical land survey inspection and upload a minimum of 4 timestamped field photographs."
      >
        <div className="space-y-6">
          {/* Minimum Requirement Banner */}
          <div
            className={`p-4 rounded-md border flex flex-wrap items-center justify-between gap-4 ${
              isComplete
                ? 'bg-green-50 border-green-300 text-green-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-md ${
                  isComplete ? 'bg-green-700 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase">
                  MANDATORY FIELD INSPECTION PHOTOGRAPHS
                </h4>
                <p className="text-xs">
                  {photos.length} of {minRequiredPhotos} minimum required photographs attached.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-sm font-bold">
                {isComplete ? 'REQUIREMENT SATISFIED' : 'ADDITIONAL PHOTOS REQUIRED'}
              </span>
            </div>
          </div>

          {/* Upload Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* File Selector */}
            <div className="border border-dashed border-slate-300 bg-slate-50 p-5 rounded-md text-center hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                id="photo-upload-input"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="photo-upload-input" className="cursor-pointer block space-y-2">
                <Upload className="w-8 h-8 text-navy-800 mx-auto" />
                <span className="font-bold text-navy-900 text-xs block uppercase">
                  Select Timestamped Field Photos
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Select multiple JPG / PNG files from device gallery
                </span>
              </label>
            </div>

            {/* Live Camera Input (HTML5 capture) */}
            <div className="border border-dashed border-slate-300 bg-slate-50 p-5 rounded-md text-center hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                id="camera-capture-input"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="camera-capture-input" className="cursor-pointer block space-y-2">
                <Camera className="w-8 h-8 text-navy-800 mx-auto" />
                <span className="font-bold text-navy-900 text-xs block uppercase">
                  Live Field Camera Capture
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Triggers mobile device rear camera for live inspection
                </span>
              </label>
            </div>
          </div>

          {/* Uploaded Photos Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-navy-900 text-xs uppercase tracking-wider">
              ATTACHED INSPECTION PHOTOGRAPHS ({photos.length})
            </h4>

            {photos.length === 0 ? (
              <div className="p-6 text-center border rounded-md bg-slate-50 text-xs text-slate-500 font-mono">
                No field inspection photos attached yet. At least 4 photographs are mandatory.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((photo, pIdx) => (
                  <div
                    key={photo.photoId}
                    className="p-3 bg-white border border-slate-300 rounded-md shadow-sm space-y-2 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] text-navy-900 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                          Photo #{pIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.photoId)}
                          className="text-red-600 hover:text-red-800 p-0.5"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="h-24 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400 my-2">
                        <ImageIcon className="w-8 h-8" />
                      </div>

                      <div className="font-bold text-navy-900 truncate" title={photo.fileName}>
                        {photo.fileName}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono">
                        Uploaded: {new Date(photo.uploadedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VRO Field Verification Notes */}
          <div className="space-y-1 pt-2 border-t">
            <label className="text-xs font-bold text-navy-900 uppercase block">
              VRO Field Inspection Findings / Remarks:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border rounded-md border-slate-300 focus:ring-navy-800"
              placeholder="e.g. Physically inspected survey boundary markers 142/3A, ground measurements match schedule..."
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-navy-900 border border-slate-300 rounded hover:bg-slate-100"
          >
            ← Back to AI Review
          </button>

          <button
            type="button"
            disabled={!isComplete}
            onClick={handleProceed}
            className={`px-6 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isComplete
                ? 'bg-navy-900 hover:bg-navy-800 text-amber-300 shadow-md cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <span>Proceed to KYC Status Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </WorkspacePanel>
    </div>
  );
};
