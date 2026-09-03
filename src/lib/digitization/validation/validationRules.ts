import { ValidationFinding, FindingSeverity } from './validationTypes';
import { MasterDataResolver, ResolutionResult } from './masterDataResolver';

export class ValidationRulesEvaluator {
  private masterResolver = new MasterDataResolver();

  // 1. District Validation (MD-DIST-001)
  public validateDistrict(districtVal?: string | null): { finding: ValidationFinding; resolution: ResolutionResult } {
    const res = this.masterResolver.resolveDistrict(districtVal || '');
    if (!districtVal || districtVal.trim() === '') {
      return {
        resolution: res,
        finding: {
          findingId: `FND-${Date.now()}-DIST-MISSING`,
          ruleId: 'MD-DIST-001',
          severity: 'ERROR',
          status: 'ERROR',
          field: 'districtName',
          message: 'District name is missing from extracted record.',
          reason: 'Administrative location requires district identification.',
          extractedValue: null,
          suggestedAction: 'Select or input district from master data list.',
        },
      };
    }

    if (res.matchLevel === 'EXACT' || res.matchLevel === 'NORMALIZED_EXACT') {
      return {
        resolution: res,
        finding: {
          findingId: `FND-${Date.now()}-DIST-PASS`,
          ruleId: 'MD-DIST-001',
          severity: 'INFO',
          status: 'PASS',
          field: 'districtName',
          message: 'District verified in master data.',
          reason: `Exact match found: ${res.matchedName} (${res.matchedCode}).`,
          extractedValue: districtVal,
          matchedMasterValue: res.matchedName,
          matchedMasterId: res.matchedId,
          matchLevel: res.matchLevel,
        },
      };
    }

    if (res.matchLevel === 'CONTROLLED_ALIAS' || res.matchLevel === 'FUZZY_CANDIDATE') {
      return {
        resolution: res,
        finding: {
          findingId: `FND-${Date.now()}-DIST-WARN`,
          ruleId: 'MD-DIST-001',
          severity: 'WARNING',
          status: 'UNVERIFIED',
          field: 'districtName',
          message: 'District candidate match requires officer review.',
          reason: `Fuzzy/alias candidate match '${res.matchedName}' for extracted value '${districtVal}'.`,
          extractedValue: districtVal,
          matchedMasterValue: res.matchedName,
          matchedMasterId: res.matchedId,
          matchLevel: res.matchLevel,
          suggestedAction: `Confirm if '${districtVal}' maps to '${res.matchedName}'.`,
        },
      };
    }

    return {
      resolution: res,
      finding: {
        findingId: `FND-${Date.now()}-DIST-FAIL`,
        ruleId: 'MD-DIST-001',
        severity: 'ERROR',
        status: 'UNVERIFIED',
        field: 'districtName',
        message: 'District not found in administrative master data.',
        reason: `No matching district found for '${districtVal}'.`,
        extractedValue: districtVal,
        suggestedAction: 'Verify original scan for historical or alternate district spelling.',
      },
    };
  }

  // 2. Mandal Validation (MD-MANDAL-001)
  public validateMandal(mandalVal?: string | null, districtId?: string): { finding: ValidationFinding; resolution: ResolutionResult } {
    const res = this.masterResolver.resolveMandal(mandalVal || '', undefined, districtId);
    if (!mandalVal || mandalVal.trim() === '') {
      return {
        resolution: res,
        finding: {
          findingId: `FND-${Date.now()}-MAN-MISSING`,
          ruleId: 'MD-MANDAL-001',
          severity: 'ERROR',
          status: 'ERROR',
          field: 'mandalName',
          message: 'Mandal name is missing from extracted record.',
          reason: 'Land record administrative location requires mandal identification.',
          extractedValue: null,
          suggestedAction: 'Select mandal from administrative dropdown.',
        },
      };
    }

    if (res.matchLevel === 'EXACT' || res.matchLevel === 'NORMALIZED_EXACT') {
      return {
        resolution: res,
        finding: {
          findingId: `FND-${Date.now()}-MAN-PASS`,
          ruleId: 'MD-MANDAL-001',
          severity: 'INFO',
          status: 'PASS',
          field: 'mandalName',
          message: 'Mandal verified in master data.',
          reason: `Exact match found: ${res.matchedName} (${res.matchedCode}).`,
          extractedValue: mandalVal,
          matchedMasterValue: res.matchedName,
          matchedMasterId: res.matchedId,
          matchLevel: res.matchLevel,
        },
      };
    }

    return {
      resolution: res,
      finding: {
        findingId: `FND-${Date.now()}-MAN-UNVERIFIED`,
        ruleId: 'MD-MANDAL-001',
        severity: 'WARNING',
        status: 'UNVERIFIED',
        field: 'mandalName',
        message: 'Mandal not verified in master data hierarchy.',
        reason: res.matchedName ? `Candidate match '${res.matchedName}' found.` : `No master data entry found for '${mandalVal}'.`,
        extractedValue: mandalVal,
        matchedMasterValue: res.matchedName,
        matchLevel: res.matchLevel,
        suggestedAction: 'Review mandal spelling or select from master list.',
      },
    };
  }

  // 3. Village Validation (MD-VILLAGE-001)
  public validateVillage(villageVal?: string | null, mandalId?: string): { finding: ValidationFinding; resolution: ResolutionResult } {
    const res = this.masterResolver.resolveVillage(villageVal || '', mandalId);
    if (!villageVal || villageVal.trim() === '') {
      return {
        resolution: res,
        finding: {
          findingId: `FND-${Date.now()}-VIL-MISSING`,
          ruleId: 'MD-VILLAGE-001',
          severity: 'ERROR',
          status: 'ERROR',
          field: 'villageName',
          message: 'Village / Ward name is missing from extracted record.',
          reason: 'Village is a mandatory land parcel location attribute.',
          extractedValue: null,
          suggestedAction: 'Input village name from revenue record scan.',
        },
      };
    }

    if (res.matchLevel === 'EXACT' || res.matchLevel === 'NORMALIZED_EXACT') {
      return {
        resolution: res,
        finding: {
          findingId: `FND-${Date.now()}-VIL-PASS`,
          ruleId: 'MD-VILLAGE-001',
          severity: 'INFO',
          status: 'PASS',
          field: 'villageName',
          message: 'Village verified in master data.',
          reason: `Exact match found: ${res.matchedName} (${res.matchedCode}).`,
          extractedValue: villageVal,
          matchedMasterValue: res.matchedName,
          matchedMasterId: res.matchedId,
          matchLevel: res.matchLevel,
        },
      };
    }

    return {
      resolution: res,
      finding: {
        findingId: `FND-${Date.now()}-VIL-UNVERIFIED`,
        ruleId: 'MD-VILLAGE-001',
        severity: 'WARNING',
        status: 'UNVERIFIED',
        field: 'villageName',
        message: 'Village not verified in master data.',
        reason: `Value '${villageVal}' does not match active village master list.`,
        extractedValue: villageVal,
        matchLevel: res.matchLevel,
        suggestedAction: 'Verify village name against mandal revenue register.',
      },
    };
  }

  // 4. Survey Number Format Validation (SURVEY-FMT-001)
  public validateSurveyNumber(surveyVal?: string | null): ValidationFinding {
    if (!surveyVal || surveyVal.trim() === '') {
      return {
        findingId: `FND-${Date.now()}-SURVEY-MISSING`,
        ruleId: 'SURVEY-FMT-001',
        severity: 'ERROR',
        status: 'ERROR',
        field: 'surveyNumber',
        message: 'Survey Number is missing.',
        reason: 'Survey number is a mandatory land record identifier.',
        extractedValue: null,
        suggestedAction: 'Extract or enter survey number from document.',
      };
    }

    const sVal = surveyVal.trim();
    const pattern = /^[0-9]+[A-Za-z0-9\/\-\_]*$/;

    if (pattern.test(sVal)) {
      return {
        findingId: `FND-${Date.now()}-SURVEY-PASS`,
        ruleId: 'SURVEY-FMT-001',
        severity: 'INFO',
        status: 'PASS',
        field: 'surveyNumber',
        message: 'Survey number format is valid.',
        reason: `Pattern match successful for '${sVal}'.`,
        extractedValue: sVal,
      };
    }

    return {
      findingId: `FND-${Date.now()}-SURVEY-FMT-WARN`,
      ruleId: 'SURVEY-FMT-001',
      severity: 'WARNING',
      status: 'WARNING',
      field: 'surveyNumber',
      message: 'Survey number contains unusual characters.',
      reason: `Format '${sVal}' deviates from standard numeric/sub-division structure.`,
      extractedValue: sVal,
      suggestedAction: 'Inspect original scan for OCR character misreads (e.g. O vs 0).',
    };
  }

  // 5. Extent Format & Value Validation (EXTENT-FMT-001 & EXTENT-VALUE-001)
  public validateExtent(extentVal?: string | null): ValidationFinding[] {
    const findings: ValidationFinding[] = [];

    if (!extentVal || extentVal.trim() === '') {
      findings.push({
        findingId: `FND-${Date.now()}-EXTENT-MISSING`,
        ruleId: 'EXTENT-FMT-001',
        severity: 'ERROR',
        status: 'ERROR',
        field: 'extentAcres',
        message: 'Land Extent is missing.',
        reason: 'Land record must state parcel extent.',
        extractedValue: null,
        suggestedAction: 'Enter extent in Acres.Cents format.',
      });
      return findings;
    }

    const eVal = extentVal.trim();
    const numMatch = eVal.match(/([0-9\.]+)/);

    if (!numMatch) {
      findings.push({
        findingId: `FND-${Date.now()}-EXTENT-NONNUMERIC`,
        ruleId: 'EXTENT-FMT-001',
        severity: 'ERROR',
        status: 'ERROR',
        field: 'extentAcres',
        message: 'Malformed land extent value.',
        reason: `Could not parse numeric value from '${eVal}'.`,
        extractedValue: eVal,
        suggestedAction: 'Correct extent to numeric value (e.g. 2.45).',
      });
      return findings;
    }

    const val = parseFloat(numMatch[1]);
    if (isNaN(val) || val <= 0) {
      findings.push({
        findingId: `FND-${Date.now()}-EXTENT-RANGE`,
        ruleId: 'EXTENT-VALUE-001',
        severity: 'ERROR',
        status: 'ERROR',
        field: 'extentAcres',
        message: 'Invalid extent numeric range.',
        reason: `Parsed extent value ${val} must be positive.`,
        extractedValue: eVal,
        suggestedAction: 'Verify extent from land schedule column.',
      });
    } else {
      findings.push({
        findingId: `FND-${Date.now()}-EXTENT-PASS`,
        ruleId: 'EXTENT-VALUE-001',
        severity: 'INFO',
        status: 'PASS',
        field: 'extentAcres',
        message: 'Extent numeric format and value valid.',
        reason: `Parsed numeric extent: ${val} Acres.Cents.`,
        extractedValue: eVal,
      });
    }

    return findings;
  }

  // 6. Category-Specific Required Fields Validation
  public validateCategoryRequiredFields(docType: string, record: Record<string, any>): ValidationFinding[] {
    const findings: ValidationFinding[] = [];
    const checkRequired = (fieldId: string, ruleId: string, label: string) => {
      const val = record[fieldId];
      if (!val || String(val).trim() === '' || String(val).trim() === 'null') {
        findings.push({
          findingId: `FND-${Date.now()}-REQ-${fieldId}`,
          ruleId,
          severity: 'ERROR',
          status: 'ERROR',
          field: fieldId,
          message: `Mandatory field '${label}' missing for document type ${docType}.`,
          reason: `Document category ${docType} requires '${label}'.`,
          extractedValue: null,
          suggestedAction: `Extract or provide mandatory field '${label}'.`,
        });
      }
    };

    if (docType === 'ADANGAL') {
      checkRequired('ownerName', 'REQUIRED-ADANGAL-001', 'Pattadar / Owner Name');
      checkRequired('surveyNumber', 'REQUIRED-ADANGAL-001', 'Survey Number');
      checkRequired('extentAcres', 'REQUIRED-ADANGAL-001', 'Extent');
    } else if (docType === 'ROR_1B') {
      checkRequired('khataNumber', 'REQUIRED-ROR1B-001', 'Khata Number');
      checkRequired('ownerName', 'REQUIRED-ROR1B-001', 'Pattadar Name');
      checkRequired('surveyNumber', 'REQUIRED-ROR1B-001', 'Survey Number');
    }

    return findings;
  }
}
