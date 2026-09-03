import { DocumentCategoryCode } from '@/config/digitizationSchemas';

export type PipelineStageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'NEEDS_REVIEW' | 'FAILED';

export type OverallProcessingStatus =
  | 'UPLOADED'
  | 'PREPROCESSING'
  | 'CLASSIFYING'
  | 'OCR_PROCESSING'
  | 'VISION_PROCESSING'
  | 'READY_FOR_AI_EXTRACTION'
  | 'READY_FOR_LANGUAGE_PROCESSING'
  | 'READY_FOR_TRANSLATION'
  | 'NEEDS_REVIEW'
  | 'FAILED';

export interface PreprocessedPage {
  pageNumber: number;
  originalPageRef: string;
  processedPageRef: string;
  width: number;
  height: number;
  rotationDegrees: number;
  skewAngle: number;
  contrastScore: number; // 0.0 to 1.0
  brightnessScore: number;
  isDeskewed: boolean;
  isCropped: boolean;
  status: PipelineStageStatus;
}

export interface ClassificationSignal {
  signalType: 'TEXT_KEYWORD' | 'HEADING_PATTERN' | 'LAYOUT_STRUCTURE' | 'TABLE_FORMAT' | 'METADATA';
  name: string;
  weight: number;
  description: string;
}

export interface ClassificationResult {
  predictedType: DocumentCategoryCode | 'UNKNOWN_OTHER';
  confidenceScore: number; // 0.0 to 1.0
  candidateTypes: Array<{
    type: DocumentCategoryCode | 'UNKNOWN_OTHER';
    score: number;
  }>;
  classificationStatus: 'CONFIDENT' | 'NEEDS_REVIEW' | 'AMBIGUOUS' | 'FAILED';
  supportingSignals: ClassificationSignal[];
  classifiedAt: string;
}

export interface OCRWord {
  text: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface OCRLine {
  lineText: string;
  confidence: number;
  words: OCRWord[];
}

export interface OCRBlock {
  blockText: string;
  blockType: 'PRINTED_TEXT' | 'HANDWRITTEN_TEXT' | 'TABLE_HEADER' | 'NUMERIC_SCHEDULE';
  confidence: number;
  lines: OCRLine[];
}

export interface NormalizedOCRPage {
  pageNumber: number;
  fullPageText: string;
  confidence: number;
  detectedLanguage: 'te' | 'en' | 'multilingual';
  blocks: OCRBlock[];
  hasHandwritingDetected: boolean;
}

export interface NormalizedOCRResult {
  extractedText: string;
  detectedLanguage: 'te' | 'en' | 'multilingual';
  overallConfidence: number;
  pageCount: number;
  pages: NormalizedOCRPage[];
  processedAt: string;
  ocrEngine: string;
}

export type VisionRegionType =
  | 'TEXT_REGION'
  | 'TABLE_REGION'
  | 'HANDWRITTEN_REGION'
  | 'STAMP_SEAL'
  | 'SIGNATURE_REGION'
  | 'MAP_REGION'
  | 'DIAGRAM_REGION'
  | 'HEADER_REGION';

export interface DetectedVisionRegion {
  regionId: string;
  pageNumber: number;
  regionType: VisionRegionType;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  description: string;
}

export interface DetectedTableColumn {
  headerName: string;
  columnIndex: number;
}

export interface DetectedTableRow {
  rowIndex: number;
  cells: string[];
}

export interface DetectedTableStructure {
  tableId: string;
  pageNumber: number;
  columns: DetectedTableColumn[];
  rows: DetectedTableRow[];
  rowCount: number;
  columnCount: number;
  confidence: number;
}

export interface DocumentQualityDiagnostic {
  resolutionStatus: 'HIGH_DPI' | 'STANDARD' | 'LOW_RESOLUTION';
  blurStatus: 'CLEAR' | 'SLIGHT_BLUR' | 'SEVERE_BLUR';
  skewStatus: 'ALIGNED' | 'SLIGHT_SKEW' | 'SEVERE_SKEW';
  contrastStatus: 'OPTIMAL' | 'LOW_CONTRAST' | 'OVEREXPOSED';
  damageStatus: 'INTACT' | 'MINOR_TEARS' | 'DAMAGED_FADED';
  handwritingDetected: boolean;
  complexLayoutDetected: boolean;
  mapRegionDetected: boolean;
  qualityWarnings: string[];
}

export interface ComputerVisionResult {
  detectedRegions: DetectedVisionRegion[];
  detectedTables: DetectedTableStructure[];
  documentQuality: DocumentQualityDiagnostic;
  processedAt: string;
  visionEngine: string;
}

export interface NormalizedDocumentRepresentation {
  jobId: string;
  digitizationId: string;
  vroSelectedType: DocumentCategoryCode;
  finalDocumentType: DocumentCategoryCode | 'UNKNOWN_OTHER';
  isTypeMismatched: boolean;
  originalDocumentRef: string;
  originalFileName: string;
  pageCount: number;
  preprocessedPages: PreprocessedPage[];
  classification: ClassificationResult;
  ocr: NormalizedOCRResult;
  vision: ComputerVisionResult;
  selectedSchemaVersion: string;
  readyForExtraction: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentProcessingJob {
  processingId: string;
  digitizationId: string;
  vroSelectedDocumentType: DocumentCategoryCode;
  detectedDocumentType: DocumentCategoryCode | 'UNKNOWN_OTHER';
  classificationMismatch: boolean;
  sourceFile: {
    originalFileName: string;
    fileType: string;
    fileSizeBytes: number;
    pageCount: number;
    storageReference: string;
    uploadedAt: string;
  };
  preprocessedPages: PreprocessedPage[];
  classificationResult?: ClassificationResult;
  ocrResult?: NormalizedOCRResult;
  visionResult?: ComputerVisionResult;
  documentQuality?: DocumentQualityDiagnostic;
  normalizedRepresentation?: NormalizedDocumentRepresentation;

  preprocessingStatus: PipelineStageStatus;
  classificationStatus: PipelineStageStatus;
  ocrStatus: PipelineStageStatus;
  visionStatus: PipelineStageStatus;
  overallStatus: OverallProcessingStatus;

  createdAt: string;
  updatedAt: string;
}
