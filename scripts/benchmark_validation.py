#!/usr/bin/env python3
"""
e-Bhoomi — Phase 4 Validation Engine Deterministic Test Benchmark
Usage:
    python scripts/benchmark_validation.py
"""

import os
import sys
import io
import json
import time

# Ensure UTF-8 output encoding for Windows terminal
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add ai-service to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai-service")))

from app.validation.validation_engine import PythonValidationEngine

def run_validation_benchmark():
    print(f"\n==================================================")
    print(f"RUNNING PHASE 4 VALIDATION ENGINE BENCHMARK (10 SCENARIOS)")
    print(f"==================================================")

    engine = PythonValidationEngine()
    results = []

    # SCENARIO 1: Valid Kurnool District -> Mandal -> Village Hierarchy
    scen1_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142/3A",
            "extentAcres": "2.45",
            "villageName": "ఆర్జనపల్లె",
            "mandalName": "అడోని",
            "districtName": "కర్నూలు",
        }
    }
    res1 = engine.validate_extraction_package(scen1_payload)
    results.append(("TEST 1: Valid Kurnool Hierarchy", "PASS", res1["status"]))

    # SCENARIO 2: Valid District + Invalid Mandal Hierarchy
    scen2_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142",
            "extentAcres": "2.45",
            "mandalName": "NonExistentMandal",
            "districtName": "Kurnool",
        }
    }
    res2 = engine.validate_extraction_package(scen2_payload)
    results.append(("TEST 2: Invalid Mandal Hierarchy", "REVIEW_REQUIRED", res2["status"]))

    # SCENARIO 3: Unknown Village
    scen3_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142",
            "extentAcres": "2.45",
            "villageName": "UnknownVillage99",
            "districtName": "Kurnool",
        }
    }
    res3 = engine.validate_extraction_package(scen3_payload)
    results.append(("TEST 3: Unknown Village", "REVIEW_REQUIRED", res3["status"]))

    # SCENARIO 4: Valid Survey Number
    scen4_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "208/1B",
            "extentAcres": "4.10",
            "districtName": "Kurnool",
        }
    }
    res4 = engine.validate_extraction_package(scen4_payload)
    results.append(("TEST 4: Valid Survey Number", "PASS", res4["status"]))

    # SCENARIO 5: Malformed Survey Number
    scen5_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "@#$%^",
            "extentAcres": "2.45",
            "districtName": "Kurnool",
        }
    }
    res5 = engine.validate_extraction_package(scen5_payload)
    results.append(("TEST 5: Malformed Survey Number", "REVIEW_REQUIRED", res5["status"]))

    # SCENARIO 6: Missing Optional Field (subDivisionNumber)
    scen6_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142",
            "extentAcres": "2.45",
            "subDivisionNumber": None,
            "districtName": "Kurnool",
        }
    }
    res6 = engine.validate_extraction_package(scen6_payload)
    results.append(("TEST 6: Missing Optional Field", "PASS", res6["status"]))

    # SCENARIO 7: Missing Required Category Field (ownerName in Adangal)
    scen7_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": None,
            "surveyNumber": "142",
            "extentAcres": "2.45",
            "districtName": "Kurnool",
        }
    }
    res7 = engine.validate_extraction_package(scen7_payload)
    results.append(("TEST 7: Missing Mandatory Category Field", "FAILED", res7["status"]))

    # SCENARIO 8: High AI Confidence + Master Data Mismatch
    scen8_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142",
            "extentAcres": "2.45",
            "districtName": "Kurnool",
            "mandalName": "UnverifiedMandal",
        },
        "fieldsConfidence": {"mandalName": {"score": 0.98, "status": "HIGH"}}
    }
    res8 = engine.validate_extraction_package(scen8_payload)
    # Validation must remain UNVERIFIED/REVIEW_REQUIRED despite confidence=0.98
    results.append(("TEST 8: High Confidence + Master Mismatch", "REVIEW_REQUIRED", res8["status"]))

    # SCENARIO 9: Legacy / Historical Administrative Name
    scen9_payload = {
        "documentType": "LEGACY_REVENUE_RECORD",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142",
            "extentAcres": "2.45",
            "districtName": "Kurnool",
            "mandalName": "OldHistoricalTalukName",
        }
    }
    res9 = engine.validate_extraction_package(scen9_payload)
    results.append(("TEST 9: Historical Administrative Name", "REVIEW_REQUIRED", res9["status"]))

    # SCENARIO 10: Real Adangal & RoR-1B Category Rule Sets
    scen10_adangal = engine.validate_extraction_package({
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142/3A",
            "extentAcres": "2.45",
            "districtName": "Kurnool",
            "mandalName": "Adoni",
        }
    })
    scen10_ror1b = engine.validate_extraction_package({
        "documentType": "ROR_1B",
        "aiExtractedRecord": {
            "khataNumber": "912",
            "ownerName": "వై. వెంకటేశ్వర్లు",
            "surveyNumber": "208/1B",
            "extentAcres": "4.10",
            "districtName": "Kurnool",
            "mandalName": "Gooty",
        }
    })
    results.append(("TEST 10A: Real Adangal Pipeline Validation", "PASS", scen10_adangal["status"]))
    results.append(("TEST 10B: Real RoR-1B Pipeline Validation", "PASS", scen10_ror1b["status"]))

    print("\n--------------------------------------------------")
    print(f"{'Scenario':<45} | {'Expected':<15} | {'Actual':<15} | {'Status'}")
    print("--------------------------------------------------")
    all_passed = True
    for name, exp, act in results:
        status_symbol = "OK" if exp == act else "MISMATCH"
        if exp != act:
            all_passed = False
        print(f"{name:<45} | {exp:<15} | {act:<15} | {status_symbol}")

    print("--------------------------------------------------")
    if all_passed:
        print("[SUCCESS] All 10 Phase 4 validation scenarios executed with 100% deterministic accuracy!")
    else:
        print("[WARN] Some scenarios yielded different status classifications.")

if __name__ == "__main__":
    run_validation_benchmark()
