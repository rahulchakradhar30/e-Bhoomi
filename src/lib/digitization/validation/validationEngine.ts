import { ValidationResponse, ValidationFinding, ValidationSummary, FindingSeverity } from './validationTypes';
import { ValidationRulesEvaluator } from './validationRules';
import { MasterDataResolver } from './masterDataResolver';

export class ValidationEngine {
  public static ENGINE_VERSION = 'v4.0-Deterministic';
  public static RULESET_VERSION = 'v4.0.0';
  public static SCHEMA_VERSION = '4.0.0';

  private evaluator = new ValidationRulesEvaluator();

  public validateRecord(
    extractionResult: Record<string, any>,
    documentType: string = 'ADANGAL',
    digitizationId?: string
  ): ValidationResponse {
    const startTime = Date.now();
    const extractedRecord = extractionResult.aiExtractedRecord || extractionResult;
    const findings: ValidationFinding[] = [];

    // 1. District Hierarchy Validation
    const distRes = this.evaluator.validateDistrict(extractedRecord.districtName || extractedRecord.district);
    findings.push(distRes.finding);

    // 2. Mandal Hierarchy Validation
    const manRes = this.evaluator.validateMandal(
      extractedRecord.mandalName || extractedRecord.mandal,
      distRes.resolution.matchedId
    );
    findings.push(manRes.finding);

    // 3. Village Hierarchy Validation
    const vilRes = this.evaluator.validateVillage(
      extractedRecord.villageName || extractedRecord.village,
      manRes.resolution.matchedId
    );
    findings.push(vilRes.finding);

    // 4. Survey Number Format Validation
    const surveyFinding = this.evaluator.validateSurveyNumber(extractedRecord.surveyNumber);
    findings.push(surveyFinding);

    // 5. Land Extent Validation
    const extentFindings = this.evaluator.validateExtent(extractedRecord.extentAcres || extractedRecord.extent);
    findings.push(...extentFindings);

    // 6. Category Mandatory Required Fields
    const reqFindings = this.evaluator.validateCategoryRequiredFields(documentType, extractedRecord);
    findings.push(...reqFindings);

    // 7. Calculate Document-Level Summary & Review Priority
    const summary = this._calculateSummary(findings);

    return {
      validationId: `VAL-${Date.now()}`,
      digitizationId: digitizationId || extractionResult.extractionId || `DIG-${Date.now()}`,
      schemaVersion: ValidationEngine.SCHEMA_VERSION,
      masterDataVersion: MasterDataResolver.MASTER_DATA_VERSION,
      ruleSetVersion: ValidationEngine.RULESET_VERSION,
      validationEngineVersion: ValidationEngine.ENGINE_VERSION,
      documentType,
      status: summary.overallValidationStatus,
      summary,
      findings,
      validatedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
    };
  }

  private _calculateSummary(findings: ValidationFinding[]): ValidationSummary {
    const counts: Record<FindingSeverity, number> = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0,
    };

    let passedCount = 0;
    let unverifiedCount = 0;

    for (const f of findings) {
      counts[f.severity] = (counts[f.severity] || 0) + 1;
      if (f.status === 'PASS') passedCount++;
      if (f.status === 'UNVERIFIED') unverifiedCount++;
    }

    let overallStatus: 'PASS' | 'REVIEW_REQUIRED' | 'FAILED' | 'UNVERIFIED' = 'PASS';
    let reviewPriority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (counts.CRITICAL > 0 || counts.ERROR > 0) {
      overallStatus = 'FAILED';
      reviewPriority = 'HIGH';
    } else if (counts.WARNING > 0 || unverifiedCount > 0) {
      overallStatus = 'REVIEW_REQUIRED';
      reviewPriority = 'MEDIUM';
    }

    return {
      overallValidationStatus: overallStatus,
      totalRulesEvaluated: findings.length,
      passedCount,
      warningCount: counts.WARNING,
      errorCount: counts.ERROR,
      criticalCount: counts.CRITICAL,
      unverifiedCount,
      reviewPriority,
      findingsCountBySeverity: counts,
    };
  }
}
