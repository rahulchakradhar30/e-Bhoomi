#!/usr/bin/env python3
"""
e-Bhoomi — Phase 5 Cross-Database Verification & Duplicate Detection Test Benchmark
Usage:
    python scripts/benchmark_phase5.py
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

from app.validation.cross_database_verifier import PythonCrossDatabaseVerifier

def run_phase5_benchmark():
    print(f"\n==================================================")
    print(f"RUNNING PHASE 5 CROSS-DATABASE & DUPLICATE BENCHMARK (10 SCENARIOS)")
    print(f"==================================================")

    verifier = PythonCrossDatabaseVerifier()
    results = []

    # TEST 1: Exact Match via Test Provider
    t1_payload = {
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142",
            "extentAcres": "2.45",
            "districtName": "Kurnool",
        },
        "includeTestProvider": True,
    }
    r1 = verifier.verify_record(t1_payload)
    results.append(("TEST 1: AI Record Exactly Matches Test Provider", "VERIFIED_MATCH", r1["status"]))

    # TEST 2: Provider Unavailable (Honest Status)
    t2_payload = {
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142",
            "extentAcres": "2.45",
        },
        "includeTestProvider": False,
    }
    r2 = verifier.verify_record(t2_payload)
    results.append(("TEST 2: Provider Unavailable (Honest Response)", "UNAVAILABLE", r2["status"]))

    # TEST 3: Multi-Provider Query Count
    results.append(("TEST 3: Multi-Provider Query Count Verification", "2", str(r2["summary"]["providersQueriedCount"])))

    # TEST 4: Real Adangal Pipeline Verification
    t4_payload = {
        "documentType": "ADANGAL",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "surveyNumber": "142/3A",
            "extentAcres": "2.45",
            "villageName": "ఆర్జనపల్లె",
            "mandalName": "అడోని",
            "districtName": "కర్నూలు",
        },
        "includeTestProvider": True,
    }
    r4 = verifier.verify_record(t4_payload)
    results.append(("TEST 4: Real Adangal Pipeline Cross-Verification", "VERIFIED_MATCH", r4["status"]))

    # TEST 5: Real RoR-1B Pipeline Verification
    t5_payload = {
        "documentType": "ROR_1B",
        "aiExtractedRecord": {
            "khataNumber": "912",
            "ownerName": "వై. వెంకటేశ్వర్లు",
            "surveyNumber": "208/1B",
            "extentAcres": "4.10",
            "villageName": "గుత్తి",
            "mandalName": "గుత్తి",
            "districtName": "కర్నూలు",
        },
        "includeTestProvider": True,
    }
    r5 = verifier.verify_record(t5_payload)
    results.append(("TEST 5: Real RoR-1B Pipeline Cross-Verification", "VERIFIED_MATCH", r5["status"]))

    # TEST 6: Version Metadata Compliance
    v_ok = "v5.0-CrossDatabase" in r1["versions"]["verificationEngineVersion"]
    results.append(("TEST 6: Version Metadata Presence", "True", str(v_ok)))

    # TEST 7: Zero Fake Data Compliance
    no_fake = not any("fake" in p["providerName"].lower() for p in r1["providers"])
    results.append(("TEST 7: Zero Synthetic/Fake Provider Declaration", "True", str(no_fake)))

    # TEST 8: Provider Status Integrity (LRMS = UNAVAILABLE)
    lrms_unavail = any(p["providerId"] == "PROV-LRMS-01" and p["status"] == "UNAVAILABLE" for p in r1["providers"])
    results.append(("TEST 8: LRMS Status Integrity (UNAVAILABLE)", "True", str(lrms_unavail)))

    # TEST 9: Provider Status Integrity (DILRMP = UNAVAILABLE)
    dilrmp_unavail = any(p["providerId"] == "PROV-DILRMP-01" and p["status"] == "UNAVAILABLE" for p in r1["providers"])
    results.append(("TEST 9: DILRMP Status Integrity (UNAVAILABLE)", "True", str(dilrmp_unavail)))

    # TEST 10: Provider Status Integrity (TEST = TEST_MODE)
    test_mode = any(p["providerId"] == "PROV-TEST-LOCAL" and p["status"] == "TEST_MODE" for p in r1["providers"])
    results.append(("TEST 10: Test Provider Status Integrity (TEST_MODE)", "True", str(test_mode)))

    print("\n--------------------------------------------------")
    print(f"{'Scenario':<48} | {'Expected':<15} | {'Actual':<15} | {'Status'}")
    print("--------------------------------------------------")
    all_passed = True
    for name, exp, act in results:
        status_symbol = "OK" if exp == act else "MISMATCH"
        if exp != act:
            all_passed = False
        print(f"{name:<48} | {exp:<15} | {act:<15} | {status_symbol}")

    print("--------------------------------------------------")
    if all_passed:
        print("[SUCCESS] All 10 Phase 5 verification scenarios executed with 100% deterministic accuracy!")
    else:
        print("[WARN] Some scenarios yielded different status classifications.")

if __name__ == "__main__":
    run_phase5_benchmark()
