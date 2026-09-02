import { DocumentCategoryCode } from './digitizationSchemas';

export interface WorkflowStepConfig {
  index: number; // 1 to 8
  id: string;
  label: string;
  shortTitle: string;
  title: string;
  guidance: string;
}

export const DIGITIZATION_WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    index: 1,
    id: 'consent',
    label: 'VRO Consent',
    shortTitle: 'Consent',
    title: 'OFFICER MANDATORY PHYSICAL VERIFICATION & LEGAL CONSENT',
    guidance: 'Confirm physical inspection of official land records and legal responsibility before initiating digitized submission.',
  },
  {
    index: 2,
    id: 'type',
    label: 'Document Category',
    shortTitle: 'Category',
    title: 'SELECT LAND RECORD DOCUMENT CATEGORY',
    guidance: 'Select the exact official document type being digitized to anchor extraction schemas and category checklist.',
  },
  {
    index: 3,
    id: 'upload',
    label: 'Document Upload',
    shortTitle: 'Upload',
    title: 'SECURE PHYSICAL DOCUMENT SCAN UPLOAD',
    guidance: 'Upload high-resolution PDF scan (preferred for multi-page records) or image files (JPG, JPEG, PNG).',
  },
  {
    index: 4,
    id: 'processing',
    label: 'Processing & OCR',
    shortTitle: 'Processing',
    title: 'AI MULTI-LINGUAL OCR & DOCUMENT UNDERSTANDING',
    guidance: 'Pre-processing, Telugu/English OCR, multi-signal classification, and computer vision analysis.',
  },
  {
    index: 5,
    id: 'review',
    label: 'AI Review & Correction',
    shortTitle: 'AI Review',
    title: 'STRUCTURED DATA REVIEW & HUMAN-IN-THE-LOOP VERIFICATION',
    guidance: 'VRO Responsibility: Compare AI-extracted fields against original paper document. Verify checkboxes and record reasons for any corrected values.',
  },
  {
    index: 6,
    id: 'field',
    label: 'Field Verification',
    shortTitle: 'Field Check',
    title: 'MANDATORY FIELD VERIFICATION & LOCATION PHOTOGRAPHS',
    guidance: 'Perform physical land survey inspection and upload a minimum of 4 timestamped field photographs.',
  },
  {
    index: 7,
    id: 'kyc',
    label: 'KYC Status Check',
    shortTitle: 'KYC Status',
    title: 'LAND OWNER CITIZEN KYC INTEGRATION STATUS',
    guidance: 'Verify citizen identity link and official government e-KYC status.',
  },
  {
    index: 8,
    id: 'final',
    label: 'Final Review & Submit',
    shortTitle: 'Final Review',
    title: 'FINAL REVIEW, OFFICERS FINAL CONSENT & RECORD SUBMISSION',
    guidance: 'Review complete digitized record summary before executing legal digitization lock.',
  },
];
