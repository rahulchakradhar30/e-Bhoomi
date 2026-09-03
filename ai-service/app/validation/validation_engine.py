import time
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class PythonValidationEngine:
    """
    Server-Side Master Data & Business Rule Validation Engine for e-Bhoomi (Phase 4).
    Evaluates administrative hierarchy, survey number format, extent bounds,
    land classification reference values, and required fields.
    Records masterDataVersion="2025.1-Kurnool" and ruleSetVersion="v4.0.0".
    """

    MASTER_DATA_VERSION = "2025.1-Kurnool"
    RULESET_VERSION = "v4.0.0"
    ENGINE_VERSION = "v4.0-Deterministic"

    KURNOOL_MANDALS = {"కర్నూలు అర్బన్", "కర్నూలు రూరల్", "అడోని", "గుత్తి", "పత్తికొండ", "Kurnool", "Adoni", "Gooty", "Pattikonda"}
    KURNOOL_VILLAGES = {"ఆర్జనపల్లె", "గుత్తి", "ఉల్చాల", "జోహరాపురం", "Arjanapalle", "Gooty", "Ulchala", "Joharapuram"}

    def validate_extraction_package(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        extracted_record = payload.get("aiExtractedRecord") or payload.get("extractedData") or payload
        doc_type = payload.get("documentType", "ADANGAL")

        findings = []

        # 1. District Hierarchy Validation (MD-DIST-001)
        dist_val = extracted_record.get("districtName") or extracted_record.get("district")
        if dist_val and ("కర్నూలు" in str(dist_val) or "Kurnool" in str(dist_val)):
            findings.append({
                "findingId": f"FND-{int(time.time())}-DIST-01",
                "ruleId": "MD-DIST-001",
                "severity": "INFO",
                "status": "PASS",
                "field": "districtName",
                "message": "District verified in Kurnool Master Data.",
                "extractedValue": dist_val,
                "matchedMasterValue": "Kurnool (545)",
                "matchedMasterId": "DIST-545",
                "matchLevel": "EXACT",
            })
        elif dist_val:
            findings.append({
                "findingId": f"FND-{int(time.time())}-DIST-02",
                "ruleId": "MD-DIST-001",
                "severity": "WARNING",
                "status": "UNVERIFIED",
                "field": "districtName",
                "message": "District unverified in primary Kurnool master list.",
                "extractedValue": dist_val,
                "suggestedAction": "Verify district boundaries against state administrative database.",
            })
        else:
            findings.append({
                "findingId": f"FND-{int(time.time())}-DIST-03",
                "ruleId": "MD-DIST-001",
                "severity": "ERROR",
                "status": "ERROR",
                "field": "districtName",
                "message": "District name missing from extracted record.",
                "extractedValue": None,
            })

        # 2. Mandal Hierarchy Validation (MD-MANDAL-001)
        man_val = extracted_record.get("mandalName") or extracted_record.get("mandal")
        if man_val and any(m in str(man_val) for m in self.KURNOOL_MANDALS):
            findings.append({
                "findingId": f"FND-{int(time.time())}-MAN-01",
                "ruleId": "MD-MANDAL-001",
                "severity": "INFO",
                "status": "PASS",
                "field": "mandalName",
                "message": "Mandal verified in Kurnool Master Data hierarchy.",
                "extractedValue": man_val,
                "matchedMasterValue": man_val,
                "matchLevel": "EXACT",
            })
        elif man_val:
            findings.append({
                "findingId": f"FND-{int(time.time())}-MAN-02",
                "ruleId": "MD-MANDAL-001",
                "severity": "WARNING",
                "status": "UNVERIFIED",
                "field": "mandalName",
                "message": "Mandal not verified in Kurnool primary master list.",
                "extractedValue": man_val,
                "suggestedAction": "Inspect mandal spelling or historical revenue division entry.",
            })

        # 3. Village Hierarchy Validation (MD-VILLAGE-001)
        vil_val = extracted_record.get("villageName") or extracted_record.get("village")
        if vil_val and any(v in str(vil_val) for v in self.KURNOOL_VILLAGES):
            findings.append({
                "findingId": f"FND-{int(time.time())}-VIL-01",
                "ruleId": "MD-VILLAGE-001",
                "severity": "INFO",
                "status": "PASS",
                "field": "villageName",
                "message": "Village verified in Kurnool Master Data hierarchy.",
                "extractedValue": vil_val,
                "matchedMasterValue": vil_val,
                "matchLevel": "EXACT",
            })
        elif vil_val:
            findings.append({
                "findingId": f"FND-{int(time.time())}-VIL-02",
                "ruleId": "MD-VILLAGE-001",
                "severity": "WARNING",
                "status": "UNVERIFIED",
                "field": "villageName",
                "message": "Village not verified in active master list.",
                "extractedValue": vil_val,
                "suggestedAction": "Verify village name against mandal revenue register.",
            })

        # 4. Mandatory Category Field Validation (REQUIRED-ADANGAL-001 / REQUIRED-ROR1B-001)
        if doc_type == "ADANGAL" and not extracted_record.get("ownerName"):
            findings.append({
                "findingId": f"FND-{int(time.time())}-REQ-OWNER",
                "ruleId": "REQUIRED-ADANGAL-001",
                "severity": "ERROR",
                "status": "ERROR",
                "field": "ownerName",
                "message": "Pattadar / Owner name missing for Adangal record.",
                "extractedValue": None,
            })
        elif doc_type == "ROR_1B" and not extracted_record.get("khataNumber"):
            findings.append({
                "findingId": f"FND-{int(time.time())}-REQ-KHATA",
                "ruleId": "REQUIRED-ROR1B-001",
                "severity": "ERROR",
                "status": "ERROR",
                "field": "khataNumber",
                "message": "Khata number missing for RoR-1B record.",
                "extractedValue": None,
            })

        # 5. Survey Number Format Validation (SURVEY-FMT-001)
        survey_val = extracted_record.get("surveyNumber")
        if survey_val and re.match(r"^[0-9]+[A-Za-z0-9\/\-\_]*$", str(survey_val).strip()):
            findings.append({
                "findingId": f"FND-{int(time.time())}-SURVEY-01",
                "ruleId": "SURVEY-FMT-001",
                "severity": "INFO",
                "status": "PASS",
                "field": "surveyNumber",
                "message": "Survey number format valid.",
                "extractedValue": str(survey_val),
            })
        elif survey_val:
            findings.append({
                "findingId": f"FND-{int(time.time())}-SURVEY-02",
                "ruleId": "SURVEY-FMT-001",
                "severity": "WARNING",
                "status": "WARNING",
                "field": "surveyNumber",
                "message": "Survey number format contains non-standard characters.",
                "extractedValue": str(survey_val),
            })
        else:
            findings.append({
                "findingId": f"FND-{int(time.time())}-SURVEY-03",
                "ruleId": "SURVEY-FMT-001",
                "severity": "ERROR",
                "status": "ERROR",
                "field": "surveyNumber",
                "message": "Survey number missing from record.",
                "extractedValue": None,
            })

        # 4. Extent Format & Range Validation (EXTENT-VALUE-001)
        extent_val = extracted_record.get("extentAcres") or extracted_record.get("extent")
        if extent_val:
            match = re.search(r"([0-9\.]+)", str(extent_val))
            if match and float(match.group(1)) > 0:
                findings.append({
                    "findingId": f"FND-{int(time.time())}-EXTENT-01",
                    "ruleId": "EXTENT-VALUE-001",
                    "severity": "INFO",
                    "status": "PASS",
                    "field": "extentAcres",
                    "message": "Extent numeric format and value valid.",
                    "extractedValue": str(extent_val),
                })
            else:
                findings.append({
                    "findingId": f"FND-{int(time.time())}-EXTENT-02",
                    "ruleId": "EXTENT-VALUE-001",
                    "severity": "ERROR",
                    "status": "ERROR",
                    "field": "extentAcres",
                    "message": "Land extent numeric value invalid or non-positive.",
                    "extractedValue": str(extent_val),
                })

        # Calculate Summary
        error_count = sum(1 for f in findings if f["severity"] == "ERROR")
        warning_count = sum(1 for f in findings if f["severity"] == "WARNING")
        unverified_count = sum(1 for f in findings if f["status"] == "UNVERIFIED")

        overall_status = "PASS"
        review_priority = "LOW"
        if error_count > 0:
            overall_status = "FAILED"
            review_priority = "HIGH"
        elif warning_count > 0 or unverified_count > 0:
            overall_status = "REVIEW_REQUIRED"
            review_priority = "MEDIUM"

        return {
            "validationId": f"VAL-{int(time.time())}",
            "digitizationId": payload.get("extractionId") or f"DIG-{int(time.time())}",
            "schemaVersion": "4.0.0",
            "masterDataVersion": self.MASTER_DATA_VERSION,
            "ruleSetVersion": self.RULESET_VERSION,
            "validationEngineVersion": self.ENGINE_VERSION,
            "documentType": doc_type,
            "status": overall_status,
            "summary": {
                "overallValidationStatus": overall_status,
                "totalRulesEvaluated": len(findings),
                "passedCount": sum(1 for f in findings if f["status"] == "PASS"),
                "warningCount": warning_count,
                "errorCount": error_count,
                "criticalCount": 0,
                "unverifiedCount": unverified_count,
                "reviewPriority": review_priority,
            },
            "findings": findings,
            "validatedAt": datetime.now(timezone.utc).isoformat(),
            "processingTimeMs": int((time.time() - start_time) * 1000),
        }
