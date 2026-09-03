export type FindingSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type FindingStatus = 'PASS' | 'WARNING' | 'ERROR' | 'UNVERIFIED' | 'NOT_APPLICABLE';

export type MasterMatchLevel = 'EXACT' | 'NORMALIZED_EXACT' | 'CONTROLLED_ALIAS' | 'FUZZY_CANDIDATE' | 'NO_MATCH';

export interface ValidationFinding {
  findingId: string;
  ruleId: string;
  severity: FindingSeverity;
  status: FindingStatus;
  field: string;
  message: string;
  reason: string;
  extractedValue?: string | null;
  expectedValue?: string | null;
  matchedMasterValue?: string | null;
  matchedMasterId?: string | null;
  matchLevel?: MasterMatchLevel;
  sourceReference?: string;
  confidenceReference?: number;
  suggestedAction?: string;
}

export interface MasterDataEntity {
  id: string;
  code: string;
  nameEn: string;
  nameTe: string;
  parentId?: string;
  type: 'DISTRICT' | 'REVENUE_DIVISION' | 'MANDAL' | 'VILLAGE' | 'SECRETARIAT';
  aliases?: string[];
}

export interface ValidationSummary {
  overallValidationStatus: 'PASS' | 'REVIEW_REQUIRED' | 'FAILED' | 'UNVERIFIED';
  totalRulesEvaluated: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  criticalCount: number;
  unverifiedCount: number;
  reviewPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  findingsCountBySeverity: Record<FindingSeverity, number>;
}

export interface ValidationResponse {
  validationId: string;
  digitizationId: string;
  schemaVersion: string;
  masterDataVersion: string;
  ruleSetVersion: string;
  validationEngineVersion: string;
  documentType: string;
  status: 'PASS' | 'REVIEW_REQUIRED' | 'FAILED' | 'UNVERIFIED';
  summary: ValidationSummary;
  findings: ValidationFinding[];
  validatedAt: string;
  processingTimeMs: number;
}

export interface RuleDefinition {
  ruleId: string;
  name: string;
  description: string;
  category: 'MASTER_DATA' | 'SURVEY_NUMBER' | 'EXTENT' | 'LAND_CLASSIFICATION' | 'OWNER_PARTY' | 'REQUIRED_FIELD' | 'CROSS_FIELD';
  defaultSeverity: FindingSeverity;
  applicableDocTypes: string[];
}
