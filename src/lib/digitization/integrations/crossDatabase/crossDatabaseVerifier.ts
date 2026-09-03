import {
  CrossDatabaseVerificationResponse,
  FieldComparison,
  CrossDatabaseVerificationSummary,
  ProviderStatus,
  ExternalQueryInput,
} from '../integrationTypes';
import { LRMSProvider } from '../lrms/lrmsProvider';
import { DILRMPProvider } from '../dilrmp/dilrmpProvider';
import { LocalTestRecordProvider } from '../test/localTestProvider';
import { DuplicateDetectionEngine } from '../duplicate/duplicateDetector';
import { ConflictDetectionEngine } from '../conflict/conflictDetector';

export class CrossDatabaseVerificationEngine {
  public static ENGINE_VERSION = 'v5.0-CrossDatabase';
  public static MATCHER_VERSION = 'v5.0-Deterministic';

  private lrmsProvider = new LRMSProvider();
  private dilrmpProvider = new DILRMPProvider();
  private testProvider = new LocalTestRecordProvider();

  private duplicateEngine = new DuplicateDetectionEngine();
  private conflictEngine = new ConflictDetectionEngine();

  public async verifyRecord(
    extractionResult: Record<string, any>,
    options: { includeTestProvider?: boolean; documentType?: string; digitizationId?: string } = {}
  ): Promise<CrossDatabaseVerificationResponse> {
    const startTime = Date.now();
    const extractedRecord = extractionResult.aiExtractedRecord || extractionResult;

    const queryInput: ExternalQueryInput = {
      surveyNumber: extractedRecord.surveyNumber,
      subDivisionNumber: extractedRecord.subDivisionNumber,
      khataNumber: extractedRecord.khataNumber,
      ownerName: extractedRecord.ownerName,
      mandalName: extractedRecord.mandalName || extractedRecord.mandal,
      villageName: extractedRecord.villageName || extractedRecord.village,
    };

    // 1. Query Providers
    const providersToQuery = [
      { instance: this.lrmsProvider, name: this.lrmsProvider.providerName },
      { instance: this.dilrmpProvider, name: this.dilrmpProvider.providerName },
    ];

    if (options.includeTestProvider) {
      providersToQuery.push({ instance: this.testProvider as any, name: this.testProvider.providerName });
    }

    const providerResponses: { providerId: string; providerName: string; status: ProviderStatus; records: Record<string, any>[] }[] = [];

    for (const item of providersToQuery) {
      const qRes = await item.instance.queryRecord(queryInput);
      providerResponses.push({
        providerId: qRes.providerId,
        providerName: item.name,
        status: qRes.status,
        records: qRes.matchedRecords,
      });
    }

    // 2. Perform Field-by-Field Comparisons
    const fieldComparisons = this._compareFields(extractedRecord, providerResponses);

    // 3. Perform Duplicate Detection
    const duplicateResults = this.duplicateEngine.detectDuplicates(
      extractedRecord,
      providerResponses.map((p) => ({ providerId: p.providerId, records: p.records }))
    );

    // 4. Perform Conflict Detection
    const conflictResults = this.conflictEngine.detectConflicts(
      extractedRecord,
      providerResponses.map((p) => ({ providerId: p.providerId, records: p.records }))
    );

    // 5. Calculate Overall Summary
    const summary = this._calculateSummary(providerResponses, fieldComparisons, duplicateResults, conflictResults);

    return {
      verificationId: `VERIF-${Date.now()}`,
      digitizationId: options.digitizationId || extractionResult.extractionId || `DIG-${Date.now()}`,
      status: summary.overallVerificationStatus,
      providers: providerResponses.map((p) => ({ providerId: p.providerId, providerName: p.providerName, status: p.status })),
      fieldComparisons,
      duplicateResults,
      conflictResults,
      summary,
      verifiedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      versions: {
        verificationEngineVersion: CrossDatabaseVerificationEngine.ENGINE_VERSION,
        matcherVersion: CrossDatabaseVerificationEngine.MATCHER_VERSION,
        providerVersions: {
          LRMS: this.lrmsProvider.version,
          DILRMP: this.dilrmpProvider.version,
          TEST: this.testProvider.version,
        },
        masterDataVersion: '2025.1-Kurnool',
        ruleSetVersion: 'v5.0.0',
      },
    };
  }

  private _compareFields(
    extractedRecord: Record<string, any>,
    providerResponses: { providerId: string; providerName: string; status: ProviderStatus; records: Record<string, any>[] }[]
  ): FieldComparison[] {
    const comparisons: FieldComparison[] = [];
    const fieldsToCompare = ['surveyNumber', 'khataNumber', 'ownerName', 'extentAcres', 'villageName'];

    for (const field of fieldsToCompare) {
      const extVal = extractedRecord[field] || extractedRecord[field === 'extentAcres' ? 'extent' : field];
      const pVals: Record<string, string | null> = {};

      let hasMatch = false;
      let hasConflict = false;
      let availableCount = 0;

      for (const p of providerResponses) {
        if (p.status === 'UNAVAILABLE') {
          pVals[p.providerId] = null;
          continue;
        }

        availableCount++;
        if (p.records.length > 0) {
          const matchedVal = p.records[0][field] || p.records[0][field === 'extentAcres' ? 'extent' : field] || null;
          pVals[p.providerId] = matchedVal;

          if (extVal && matchedVal && (extVal === matchedVal || String(extVal).trim() === String(matchedVal).trim())) {
            hasMatch = true;
          } else if (extVal && matchedVal) {
            hasConflict = true;
          }
        } else {
          pVals[p.providerId] = null;
        }
      }

      if (availableCount === 0) {
        comparisons.push({
          field,
          extractedValue: extVal,
          providerValues: pVals,
          matchStatus: 'UNAVAILABLE',
          severity: 'INFO',
          reason: 'External data providers are unavailable in current environment.',
        });
      } else if (hasConflict) {
        comparisons.push({
          field,
          extractedValue: extVal,
          providerValues: pVals,
          matchStatus: 'CONFLICT',
          severity: 'ERROR',
          reason: `Discrepancy detected for field '${field}' between AI extracted record and external provider records.`,
        });
      } else if (hasMatch) {
        comparisons.push({
          field,
          extractedValue: extVal,
          providerValues: pVals,
          matchStatus: 'EXACT_MATCH',
          severity: 'INFO',
          reason: `Field '${field}' verified across external provider records.`,
        });
      } else {
        comparisons.push({
          field,
          extractedValue: extVal,
          providerValues: pVals,
          matchStatus: 'NOT_FOUND',
          severity: 'WARNING',
          reason: `Field '${field}' could not be verified in available external records.`,
        });
      }
    }

    return comparisons;
  }

  private _calculateSummary(
    providerResponses: { providerId: string; status: ProviderStatus; records: Record<string, any>[] }[],
    fieldComparisons: FieldComparison[],
    duplicateResults: any[],
    conflictResults: any[]
  ): CrossDatabaseVerificationSummary {
    const availableProvidersCount = providerResponses.filter((p) => p.status === 'CONNECTED' || p.status === 'TEST_MODE').length;
    const unavailableProvidersCount = providerResponses.filter((p) => p.status === 'UNAVAILABLE').length;

    const exactFieldMatchesCount = fieldComparisons.filter((c) => c.matchStatus === 'EXACT_MATCH').length;
    const conflictsCount = conflictResults.length;
    const duplicatesCount = duplicateResults.length;

    let status: 'VERIFIED_MATCH' | 'REVIEW_REQUIRED' | 'CONFLICT_DETECTED' | 'UNAVAILABLE' | 'UNVERIFIED' = 'UNVERIFIED';
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (availableProvidersCount === 0) {
      status = 'UNAVAILABLE';
      priority = 'MEDIUM';
    } else if (conflictsCount > 0) {
      status = 'CONFLICT_DETECTED';
      priority = 'HIGH';
    } else if (duplicatesCount > 0) {
      status = 'REVIEW_REQUIRED';
      priority = 'HIGH';
    } else if (exactFieldMatchesCount > 0) {
      status = 'VERIFIED_MATCH';
      priority = 'LOW';
    }

    return {
      overallVerificationStatus: status,
      providersQueriedCount: providerResponses.length,
      availableProvidersCount,
      unavailableProvidersCount,
      exactFieldMatchesCount,
      conflictsCount,
      duplicatesCount,
      reviewPriority: priority,
    };
  }
}
