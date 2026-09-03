import { DuplicateResult, DuplicateCategory } from '../integrationTypes';

export class DuplicateDetectionEngine {
  public static ENGINE_VERSION = 'v5.0-DuplicateEngine';

  public detectDuplicates(
    extractedRecord: Record<string, any>,
    providerRecords: { providerId: string; records: Record<string, any>[] }[]
  ): DuplicateResult[] {
    const results: DuplicateResult[] = [];

    const eSurvey = extractedRecord.surveyNumber ? String(extractedRecord.surveyNumber).trim() : null;
    const eSubdiv = extractedRecord.subDivisionNumber ? String(extractedRecord.subDivisionNumber).trim() : null;
    const eKhata = extractedRecord.khataNumber ? String(extractedRecord.khataNumber).trim() : null;
    const eOwner = extractedRecord.ownerName ? String(extractedRecord.ownerName).trim() : null;
    const eVillage = extractedRecord.villageName || extractedRecord.village;

    for (const group of providerRecords) {
      for (const rec of group.records) {
        const matchingFields: string[] = [];
        const differingFields: string[] = [];

        const rSurvey = rec.surveyNumber ? String(rec.surveyNumber).trim() : null;
        const rSubdiv = rec.subDivisionNumber ? String(rec.subDivisionNumber).trim() : null;
        const rKhata = rec.khataNumber ? String(rec.khataNumber).trim() : null;
        const rOwner = rec.ownerName ? String(rec.ownerName).trim() : null;
        const rVillage = rec.villageName || rec.village;

        if (eSurvey && rSurvey && eSurvey === rSurvey) matchingFields.push('surveyNumber');
        else if (eSurvey && rSurvey) differingFields.push('surveyNumber');

        if (eSubdiv && rSubdiv && eSubdiv === rSubdiv) matchingFields.push('subDivisionNumber');
        else if (eSubdiv && rSubdiv) differingFields.push('subDivisionNumber');

        if (eKhata && rKhata && eKhata === rKhata) matchingFields.push('khataNumber');
        else if (eKhata && rKhata) differingFields.push('khataNumber');

        if (eOwner && rOwner && (eOwner === rOwner || eOwner.includes(rOwner) || rOwner.includes(eOwner))) {
          matchingFields.push('ownerName');
        } else if (eOwner && rOwner) {
          differingFields.push('ownerName');
        }

        if (eVillage && rVillage && (eVillage === rVillage || eVillage.includes(rVillage))) {
          matchingFields.push('villageName');
        }

        let cat: DuplicateCategory = 'NO_DUPLICATE_FOUND';
        let matchConf: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED' = 'LOW';
        let reason = '';

        if (matchingFields.includes('surveyNumber') && matchingFields.includes('subDivisionNumber') && matchingFields.includes('khataNumber') && matchingFields.includes('ownerName')) {
          cat = 'EXACT_DUPLICATE';
          matchConf = 'HIGH';
          reason = `Exact duplicate record detected across survey ${eSurvey}/${eSubdiv}, khata ${eKhata}, and owner name.`;
        } else if (matchingFields.includes('surveyNumber') && matchingFields.includes('subDivisionNumber') && matchingFields.includes('khataNumber')) {
          cat = 'POSSIBLE_DUPLICATE';
          matchConf = 'HIGH';
          reason = `Same survey ${eSurvey}/${eSubdiv} and khata ${eKhata} found in provider database.`;
        } else if (matchingFields.includes('surveyNumber') && matchingFields.includes('ownerName')) {
          cat = 'POSSIBLE_DUPLICATE';
          matchConf = 'MEDIUM';
          reason = `Same survey ${eSurvey} and owner name matched existing record.`;
        } else if (matchingFields.includes('surveyNumber')) {
          cat = 'RELATED_RECORD';
          matchConf = 'LOW';
          reason = `Related record found for survey number ${eSurvey}.`;
        }

        if (cat !== 'NO_DUPLICATE_FOUND') {
          results.push({
            candidateId: rec.recordId || rec.id || `CAND-${Date.now()}`,
            sourceProvider: group.providerId,
            duplicateCategory: cat,
            matchConfidence: matchConf,
            matchingFields,
            differingFields,
            reason,
            candidateRecord: rec,
          });
        }
      }
    }

    return results;
  }
}
