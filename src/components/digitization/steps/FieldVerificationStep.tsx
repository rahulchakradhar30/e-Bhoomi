'use client';

import React, { useEffect, useState } from 'react';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { FieldVerificationRecord, FieldVerificationPhoto } from '@/types/digitizationCase';
import { Camera, Image as ImageIcon, Trash2, AlertCircle, Upload } from 'lucide-react';

interface FieldVerificationStepProps {
  initialVerification?: FieldVerificationRecord;
  onVerificationCompleted: (fieldRecord: FieldVerificationRecord) => void;
  onValidityChange?: (isValid: boolean) => void;
  onBack?: () => void;
}

export const FieldVerificationStep: React.FC<FieldVerificationStepProps> = ({
  initialVerification,
  onVerificationCompleted,
  onValidityChange,
}) => {
  const [photos, setPhotos] = useState<FieldVerificationPhoto[]>(initialVerification?.photos || []);
  const [notes, setNotes] = useState<string>(initialVerification?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const minRequiredPhotos = 4;
  const isComplete = photos.length >= minRequiredPhotos;

  useEffect(() => {
    onValidityChange?.(isComplete);

    if (isComplete) {
      const fieldRecord: FieldVerificationRecord = {
        photos,
        status: 'VERIFIED',
        notes: notes.trim(),
        verifiedByOfficerId: 'AP-545-VRO-00101',
        verifiedAt: new Date().toISOString(),
      };
      onVerificationCompleted(fieldRecord);
    }
  }, [photos, notes]);

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

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <WorkspacePanel
        title="MANDATORY FIELD INSPECTION & PHOTOGRAPHS"
        guidance="VRO Field Inspection Duty: Perform ground survey verification and upload a minimum of 4 timestamped field photographs."
      >
        <div className="space-y-4">
          {/* Requirement Status Banner */}
          <div
            className={`p-3.5 rounded-md border flex flex-wrap items-center justify-between gap-3 text-xs ${
              isComplete
                ? 'bg-green-50 border-green-300 text-green-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded ${
                  isComplete ? 'bg-green-700 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold uppercase">
                  MANDATORY FIELD INSPECTION PHOTOGRAPHS
                </h4>
                <p className="text-[11px]">
                  {photos.length} of {minRequiredPhotos} minimum required photographs attached.
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white border">
              {isComplete ? 'REQUIREMENT SATISFIED' : 'MIN 4 PHOTOS REQUIRED'}
            </span>
          </div>

          {/* Upload & Camera Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-dashed border-slate-300 bg-slate-50 p-4 rounded-md text-center hover:bg-slate-100/70 transition-colors">
              <input
                type="file"
                id="photo-upload-input"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="photo-upload-input" className="cursor-pointer block space-y-1.5">
                <Upload className="w-6 h-6 text-navy-900 mx-auto" />
                <span className="font-bold text-navy-900 text-xs block uppercase">
                  Select Field Inspection Photos
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Select multiple JPG / PNG images from device
                </span>
              </label>
            </div>

            <div className="border border-dashed border-slate-300 bg-slate-50 p-4 rounded-md text-center hover:bg-slate-100/70 transition-colors">
              <input
                type="file"
                id="camera-capture-input"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="camera-capture-input" className="cursor-pointer block space-y-1.5">
                <Camera className="w-6 h-6 text-navy-900 mx-auto" />
                <span className="font-bold text-navy-900 text-xs block uppercase">
                  Live Rear Camera Capture
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Triggers mobile device camera for live inspection
                </span>
              </label>
            </div>
          </div>

          {/* Attached Photo Cards */}
          <div className="space-y-2">
            <h4 className="font-bold text-navy-900 text-xs uppercase tracking-wider">
              ATTACHED INSPECTION PHOTOGRAPHS ({photos.length})
            </h4>

            {photos.length === 0 ? (
              <div className="p-5 text-center border rounded-md bg-slate-50 text-xs text-slate-500 font-mono">
                No field inspection photos attached yet. A minimum of 4 photographs is mandatory before final submit.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((photo, pIdx) => (
                  <div
                    key={photo.photoId}
                    className="p-3 bg-white border border-slate-300 rounded-md shadow-xs text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
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

                      <div className="h-20 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400 my-2">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>

                      <div className="font-bold text-navy-900 truncate" title={photo.fileName}>
                        {photo.fileName}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(photo.uploadedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remarks input */}
          <div className="space-y-1 pt-2 border-t">
            <label className="text-xs font-bold text-navy-900 uppercase block">
              VRO Field Inspection Findings / Remarks:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border rounded-md border-slate-300 focus:ring-navy-800"
              placeholder="Physically inspected survey boundary markers 142/3A, ground measurements match schedule..."
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </WorkspacePanel>
    </div>
  );
};
