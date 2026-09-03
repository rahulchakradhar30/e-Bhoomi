export interface ProcessingStatistics {
  documentsUploaded: number;
  documentsProcessed: number;
  documentsCompleted: number;
  documentsFailed: number;
  documentsPendingReview: number;
  documentsFinalized: number;
  processingSuccessRatePct: number;
  averageProcessingDurationSeconds: number;
}

export interface FieldCorrectionMetrics {
  totalFieldsExtracted: number;
  totalFieldsReviewed: number;
  fieldsAcceptedCount: number;
  fieldsCorrectedCount: number;
  fieldsUnverifiedCount: number;
  overallCorrectionRatePct: number;
  overallAcceptanceRatePct: number;
  perFieldCorrectionRates: Record<string, { accepted: number; corrected: number; ratePct: number }>;
}

export interface LocationAnalytics {
  districtName: string;
  mandalName?: string;
  villageName?: string;
  documentsProcessed: number;
  documentsPending: number;
  documentsFinalized: number;
  correctionRatePct: number;
}

export interface SystemAnalyticsSummary {
  statistics: ProcessingStatistics;
  fieldMetrics: FieldCorrectionMetrics;
  locations: LocationAnalytics[];
  generatedAt: string;
  hasData: boolean;
}
