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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1000px', margin: '0 auto' }}>
      <WorkspacePanel
        title="MANDATORY FIELD INSPECTION & PHOTOGRAPHS"
        guidance="VRO Field Inspection Duty: Perform ground survey verification and upload a minimum of 4 timestamped field photographs."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Requirement Status Banner */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '8px',
              border: `1px solid ${isComplete ? '#86efac' : '#fde68a'}`,
              background: isComplete ? '#f0fdf4' : '#fefce8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: isComplete ? '#166534' : '#d97706',
                  color: '#ffffff',
                  display: 'flex',
                }}
              >
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: isComplete ? '#14532d' : '#854d0e', textTransform: 'uppercase', margin: 0 }}>
                  MANDATORY FIELD INSPECTION PHOTOGRAPHS
                </h4>
                <p style={{ fontSize: '0.75rem', color: isComplete ? '#166534' : '#92400e', margin: '2px 0 0 0' }}>
                  {photos.length} of {minRequiredPhotos} minimum required photographs attached.
                </p>
              </div>
            </div>

            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '6px',
              background: '#ffffff',
              border: `1px solid ${isComplete ? '#86efac' : '#fde68a'}`,
              color: isComplete ? '#166534' : '#854d0e',
            }}>
              {isComplete ? 'REQUIREMENT SATISFIED' : 'MIN 4 PHOTOS REQUIRED'}
            </span>
          </div>

          {/* Upload & Camera Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="digi-upload-zone" style={{ padding: '20px' }}>
              <input
                type="file"
                id="photo-upload-input"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="photo-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Upload className="w-6 h-6 text-navy-900" />
                <span style={{ fontWeight: 800, color: '#0b2545', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  Select Field Photos
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Select multiple JPG / PNG images from device
                </span>
              </label>
            </div>

            <div className="digi-upload-zone" style={{ padding: '20px' }}>
              <input
                type="file"
                id="camera-capture-input"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="camera-capture-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Camera className="w-6 h-6 text-navy-900" />
                <span style={{ fontWeight: 800, color: '#0b2545', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  Live Rear Camera Capture
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Triggers mobile device camera for live inspection
                </span>
              </label>
            </div>
          </div>

          {/* Attached Photo Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0b2545', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              ATTACHED INSPECTION PHOTOGRAPHS ({photos.length})
            </h4>

            {photos.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
                No field inspection photos attached yet. A minimum of 4 photographs is mandatory before final submit.
              </div>
            ) : (
              <div className="digi-photo-grid">
                {photos.map((photo, pIdx) => (
                  <div key={photo.photoId} className="digi-photo-card">
                    <div className="digi-photo-card-top">
                      <span className="digi-photo-num-badge">
                        Photo #{pIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.photoId)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="digi-photo-thumb">
                      <ImageIcon className="w-7 h-7" />
                    </div>

                    <div className="digi-photo-filename" title={photo.fileName}>
                      {photo.fileName}
                    </div>

                    <div className="digi-photo-time">
                      {new Date(photo.uploadedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remarks input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0b2545', textTransform: 'uppercase' }}>
              VRO Field Inspection Findings / Remarks:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="digi-edit-textarea"
              placeholder="Physically inspected survey boundary markers 142/3A, ground measurements match schedule..."
            />
          </div>

          {errorMsg && (
            <div className="digi-proc-error-box">
              <div className="digi-proc-error-title">
                <AlertCircle className="w-4 h-4" />
                <span>Inspection Error</span>
              </div>
              <p className="digi-proc-error-msg">{errorMsg}</p>
            </div>
          )}
        </div>
      </WorkspacePanel>
    </div>
  );
};
