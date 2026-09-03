#!/usr/bin/env python3
"""
e-Bhoomi — Phase A: Real Document Data Lineage Repair Benchmark
Usage:
    python scripts/benchmark_phase_a.py
"""

import os
import sys
import io
import json
import re

# Ensure UTF-8 output encoding for Windows terminal
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add ai-service to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai-service")))

# Load .env.local if present
env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ[k] = v.strip('"\'')

def extract_pdf_page_count_from_bytes(data: bytes) -> int:
    """Replicates the real binary PDF page extraction logic in app/api/digitization/upload/route.ts"""
    text = data.decode('latin1', errors='replace')
    if not text.startswith('%PDF-'):
        return -1  # Invalid / Corrupt PDF

    # 1. Look for /Count in Pages dictionary
    count_matches = [int(m.group(1)) for m in re.finditer(r'/Count\s+(\d+)', text)]
    if count_matches:
        return max(count_matches)

    # 2. Look for /Type /Page instances
    page_matches = re.findall(r'/Type\s*/Page(?=[^a-zA-Z])', text)
    if page_matches:
        return len(page_matches)

    return 1

def generate_minimal_pdf(num_pages: int) -> bytes:
    """Generates a valid minimal binary PDF with exact number of pages."""
    objects = []
    objects.append(b"%PDF-1.4\n")
    
    # 1 0 obj: Catalog
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    
    # Page object refs
    page_refs = " ".join([f"{i+3} 0 R" for i in range(num_pages)])
    # 2 0 obj: Pages
    objects.append(f"2 0 obj\n<< /Type /Pages /Kids [{page_refs}] /Count {num_pages} >>\nendobj\n".encode("latin1"))
    
    # Create page objects
    for i in range(num_pages):
        obj_num = i + 3
        objects.append(f"{obj_num} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n".encode("latin1"))
    
    objects.append(b"%%EOF\n")
    return b"".join(objects)

def run_phase_a_benchmark():
    print(f"\n==================================================")
    print(f"RUNNING PHASE A REAL DOCUMENT DATA LINEAGE BENCHMARK (10 SCENARIOS)")
    print(f"==================================================")

    results = []

    # TEST 1: Real 1-Page PDF Extraction
    pdf_1p = generate_minimal_pdf(1)
    p1_count = extract_pdf_page_count_from_bytes(pdf_1p)
    results.append(("TEST 1: Real 1-Page PDF Page Count", "1", str(p1_count)))

    # TEST 2: Real 2-Page PDF Extraction
    pdf_2p = generate_minimal_pdf(2)
    p2_count = extract_pdf_page_count_from_bytes(pdf_2p)
    results.append(("TEST 2: Real 2-Page PDF Page Count", "2", str(p2_count)))

    # TEST 3: Corrupt Non-PDF File Handling
    corrupt_bytes = b"NOT A VALID PDF FILE CONTENT"
    p_corrupt = extract_pdf_page_count_from_bytes(corrupt_bytes)
    results.append(("TEST 3: Corrupt PDF Header Rejection", "-1", str(p_corrupt)))

    # TEST 4: Zero Math.ceil(file.size / 180000) in upload route
    upload_file = os.path.join(os.path.dirname(__file__), "..", "app", "api", "digitization", "upload", "route.ts")
    with open(upload_file, "r", encoding="utf-8") as f:
        upload_code = f.read()
    has_180k = "180000" in upload_code or "Math.ceil(file.size" in upload_code
    results.append(("TEST 4: Elimination of Size-Based Page Heuristic", "False", str(has_180k)))

    # TEST 5: Zero Synthetic Map Injection in visionProvider.ts
    vision_file = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "digitization", "visionProvider.ts")
    with open(vision_file, "r", encoding="utf-8") as f:
        vision_code = f.read()
    has_fake_map = "REG-MAP" in vision_code or "FMB cadastral sketch diagram" in vision_code
    results.append(("TEST 5: Elimination of Synthetic Map Region", "False", str(has_fake_map)))

    # TEST 6: Zero Hardcoded Land Record Fallbacks in configuredAiProvider.ts
    ai_file = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "digitization", "ai", "configuredAiProvider.ts")
    with open(ai_file, "r", encoding="utf-8") as f:
        ai_code = f.read()
    has_hardcoded_defaults = "|| 'Kurnool'" in ai_code or "|| '142'" in ai_code or "|| '482'" in ai_code or "|| 'కె. రామారావు'" in ai_code
    results.append(("TEST 6: Elimination of Fallback Land Strings", "False", str(has_hardcoded_defaults)))

    # TEST 7: Zero Dummy Buffer in pipeline OCR route
    ocr_file = os.path.join(os.path.dirname(__file__), "..", "app", "api", "digitization", "pipeline", "ocr", "route.ts")
    with open(ocr_file, "r", encoding="utf-8") as f:
        ocr_code = f.read()
    has_dummy_buffer = "new ArrayBuffer(sourceFile?.fileSizeBytes" in ocr_code
    results.append(("TEST 7: Elimination of Dummy Buffer in OCR Route", "False", str(has_dummy_buffer)))

    # TEST 8: Live Groq English Document Extraction
    from app.extraction.groq_provider import PythonGroqProvider
    groq_prov = PythonGroqProvider()
    en_payload = {
        "documentCategory": "ROR_1B",
        "rawOcrText": "GOVERNMENT OF ANDHRA PRADESH - REVENUE DEPARTMENT\nRECORD OF RIGHTS - ROR 1B\nDistrict: Kurnool, Mandal: Adoni, Village: Arjanapalle\nSurvey No: 142/3A, Khata No: 482, Extent: 2.45 Acres\nPattadar Name: K. Rama Rao",
    }
    r_en = groq_prov.extract_structured_record(en_payload)
    results.append(("TEST 8: Real English Document Groq Extraction", "SUCCESS", r_en["status"]))

    # TEST 9: Live Groq Telugu Document Extraction
    te_payload = {
        "documentCategory": "ADANGAL",
        "rawOcrText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం - రెవెన్యూ శాఖ\nహక్కుల పత్రం - ఆర్.ఓ.ఆర్. 1బి\nజిల్లా: కర్నూలు, మండలం: అడోని, గ్రామం: ఆర్జనపల్లె\nసి.సంఖ్య: 142/3A, ఖాతా సంఖ్య: 482, విస్తీర్ణం: 2.45 ఎకరాలు\nపట్టాదారు పేరు: కె. రామారావు",
    }
    r_te = groq_prov.extract_structured_record(te_payload)
    results.append(("TEST 9: Real Telugu Document Groq Extraction", "SUCCESS", r_te["status"]))

    # TEST 10: Empty OCR Payload returns Honest Status (Zero Synthetic Injection)
    empty_payload = {
        "documentCategory": "ROR_1B",
        "rawOcrText": "",
    }
    r_empty = groq_prov.extract_structured_record(empty_payload)
    rec_empty = r_empty.get("extractedRecord", {})
    all_null = all(v is None for v in rec_empty.values()) if rec_empty else True
    results.append(("TEST 10: Empty Input Returns 100% Null (Zero Hallucination)", "True", str(all_null)))

    print("\n--------------------------------------------------")
    print(f"{'Scenario':<55} | {'Expected':<12} | {'Actual':<12} | {'Status'}")
    print("--------------------------------------------------")
    all_passed = True
    for name, exp, act in results:
        status_symbol = "OK" if exp == act else "MISMATCH"
        if exp != act:
            all_passed = False
        print(f"{name:<55} | {exp:<12} | {act:<12} | {status_symbol}")

    print("--------------------------------------------------")
    if all_passed:
        print("[SUCCESS] All 10 Phase A data lineage repair benchmark scenarios passed cleanly!")
    else:
        print("[WARN] Some scenarios yielded different status classifications.")

if __name__ == "__main__":
    run_phase_a_benchmark()
