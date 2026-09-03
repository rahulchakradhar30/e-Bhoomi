export type ProviderType = 'LRMS' | 'DILRMP' | 'MASTER_DATA' | 'LOCAL_ARCHIVE' | 'TEST_PROVIDER' | 'GIS';

export type ProviderStatus =
  | 'CONNECTED'
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'AUTH_REQUIRED'
  | 'CONFIGURATION_MISSING'
  | 'ERROR'
  | 'TEST_MODE';

export type FieldMatchStatus =
  | 'EXACT_MATCH'
  | 'NORMALIZED_MATCH'
  | 'CONTROLLED_ALIAS_MATCH'
  | 'PARTIAL_MATCH'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'UNVERIFIED'
  | 'UNAVAILABLE';

export type DuplicateCategory =
  | 'EXACT_DUPLICATE'
  | 'POSSIBLE_DUPLICATE'
  | 'RELATED_RECORD'
  | 'NO_DUPLICATE_FOUND'
  | 'UNVERIFIED';

export interface FieldComparison {
  field: string;
  extractedValue?: string | null;
  providerValues: Record<string, string | null>;
  matchStatus: FieldMatchStatus;
  matchMethod?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  reason: string;
  evidenceReference?: string;
}

export interface DuplicateResult {
  candidateId: string;
  sourceProvider: string;
  duplicateCategory: DuplicateCategory;
  matchConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
  matchingFields: string[];
  differingFields: string[];
  reason: string;
  candidateRecord: Record<string, any>;
}

export interface ConflictResult {
  conflictId: string;
  ruleId: string;
  field: string;
  extractedValue?: string | null;
  providerValue?: string | null;
  providerId: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  reason: string;
  recommendedAction: string;
}

export interface ExternalQueryInput {
  districtCode?: string;
  mandalCode?: string;
  villageCode?: string;
  districtName?: string;
  mandalName?: string;
  villageName?: string;
  surveyNumber?: string;
  subDivisionNumber?: string;
  khataNumber?: string;
  ownerName?: string;
  registrationNumber?: string;
  mutationReference?: string;
}

export interface LandRecordDataProvider {
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  version: string;

  healthCheck(): Promise<ProviderStatus>;
  queryRecord(input: ExternalQueryInput): Promise<{
    providerId: string;
    status: ProviderStatus;
    matchedRecords: Record<string, any>[];
    rawMetadata?: Record<string, any>;
    queriedAt: string;
  }>;
}

export interface CrossDatabaseVerificationSummary {
  overallVerificationStatus: 'VERIFIED_MATCH' | 'REVIEW_REQUIRED' | 'CONFLICT_DETECTED' | 'UNAVAILABLE' | 'UNVERIFIED';
  providersQueriedCount: number;
  availableProvidersCount: number;
  unavailableProvidersCount: number;
  exactFieldMatchesCount: number;
  conflictsCount: number;
  duplicatesCount: number;
  reviewPriority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CrossDatabaseVerificationResponse {
  verificationId: string;
  digitizationId: string;
  status: 'VERIFIED_MATCH' | 'REVIEW_REQUIRED' | 'CONFLICT_DETECTED' | 'UNAVAILABLE' | 'UNVERIFIED';
  providers: { providerId: string; providerName: string; status: ProviderStatus }[];
  fieldComparisons: FieldComparison[];
  duplicateResults: DuplicateResult[];
  conflictResults: ConflictResult[];
  summary: CrossDatabaseVerificationSummary;
  verifiedAt: string;
  processingTimeMs: number;
  versions: {
    verificationEngineVersion: string;
    matcherVersion: string;
    providerVersions: Record<string, string>;
    masterDataVersion: string;
    ruleSetVersion: string;
  };
}
