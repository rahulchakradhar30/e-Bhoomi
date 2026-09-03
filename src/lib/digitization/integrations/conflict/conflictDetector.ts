import { ConflictResult } from '../integrationTypes';

export class ConflictDetectionEngine {
  public static ENGINE_VERSION = 'v5.0-ConflictEngine';

  public detectConflicts(
    extractedRecord: Record<string, any>,
    providerRecords: { providerId: string; records: Record<string, any>[] }[]
  ): ConflictResult[] {
    const conflicts: ConflictResult[] = [];

    const eOwner = extractedRecord.ownerName ? String(extractedRecord.ownerName).trim() : null;
    const eExtent = extractedRecord.extentAcres || extractedRecord.extent ? String(extractedRecord.extentAcres || extractedRecord.extent).trim() : null;

    for (const group of providerRecords) {
      for (const rec of group.records) {
        // 1. Owner Name Conflict Check
        const rOwner = rec.ownerName ? String(rec.ownerName).trim() : null;
        if (eOwner && rOwner && eOwner !== rOwner && !eOwner.includes(rOwner) && !rOwner.includes(eOwner)) {
          conflicts.push({
            conflictId: `CNF-${Date.now()}-OWNER`,
            ruleId: 'CONF-OWNER-001',
            field: 'ownerName',
            extractedValue: eOwner,
            providerValue: rOwner,
            providerId: group.providerId,
            severity: 'ERROR',
            reason: `Conflicting owner name for survey ${extractedRecord.surveyNumber}: extracted '${eOwner}' vs external provider '${rOwner}'.`,
            recommendedAction: 'Human VRO review required to verify chain of title and mutation register.',
          });
        }

        // 2. Extent Discrepancy Conflict Check
        const rExtent = rec.extentAcres ? String(rec.extentAcres).trim() : null;
        if (eExtent && rExtent && parseFloat(eExtent) !== parseFloat(rExtent)) {
          conflicts.push({
            conflictId: `CNF-${Date.now()}-EXTENT`,
            ruleId: 'CONF-EXTENT-001',
            field: 'extentAcres',
            extractedValue: eExtent,
            providerValue: rExtent,
            providerId: group.providerId,
            severity: 'WARNING',
            reason: `Discrepancy in parcel extent for survey ${extractedRecord.surveyNumber}: extracted ${eExtent} Acres vs external record ${rExtent} Acres.`,
            recommendedAction: 'Inspect field measurement book (FMB) scan for exact sub-division area.',
          });
        }
      }
    }

    return conflicts;
  }
}
