#!/usr/bin/env python3
"""
e-Bhoomi — Phase 1C: Telugu Printed vs Handwritten OCR Benchmark Script
Usage:
    python scripts/benchmark_ocr.py --file test-docs/sample.jpg --mode mixed
"""

import os
import sys
import time
import argparse
from typing import Dict, Any

# Add ai-service to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-service"))

from app.preprocessing.document_preprocessor import DocumentPreprocessor
from app.ocr.telugu_ocr_provider import TeluguOCRProvider
from app.ocr.telugu_handwritten_provider import TeluguHandwrittenOCRProvider
from app.ocr.region_router import OCRRegionRouter

def calculate_cer(reference: str, hypothesis: str) -> float:
    """
    Computes Character Error Rate (CER) using Levenshtein distance.
    """
    if not reference:
        return 0.0 if not hypothesis else 1.0

    r = list(reference)
    h = list(hypothesis)
    d = [[0] * (len(h) + 1) for _ in range(len(r) + 1)]

    for i in range(len(r) + 1):
        d[i][0] = i
    for j in range(len(h) + 1):
        d[0][j] = j

    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            if r[i - 1] == h[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = min(
                    d[i - 1][j] + 1,      # deletion
                    d[i][j - 1] + 1,      # insertion
                    d[i - 1][j - 1] + 1,  # substitution
                )

    return float(d[len(r)][len(h)]) / float(len(r))

def run_benchmark(file_path: str, mode: str = "mixed") -> Dict[str, Any]:
    print(f"\n==================================================")
    print(f"BENCHMARKING FILE: {os.path.basename(file_path)} [MODE: {mode.upper()}]")
    print(f"==================================================")

    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return {}

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    preprocessor = DocumentPreprocessor()
    prep_start = time.time()
    pages_bgr = preprocessor._extract_pages_as_images(file_bytes, "application/pdf" if file_path.endswith(".pdf") else "image/jpeg")
    prep_time = time.time() - prep_start

    print(f"[Phase 1A Preprocessing] Rendered {len(pages_bgr)} page(s) in {prep_time:.3f}s")

    ocr_start = time.time()
    if mode == "printed":
        provider = TeluguOCRProvider()
        ocr_res = provider.process_document_images(pages_bgr)
    elif mode == "handwritten":
        provider = TeluguHandwrittenOCRProvider()
        ocr_res = provider.process_document_images(pages_bgr)
    else:
        router = OCRRegionRouter()
        ocr_res = router.process_document_with_region_routing(pages_bgr)

    ocr_time = time.time() - ocr_start

    print(f"[Phase 1C OCR Result] Provider: {ocr_res.get('provider')}")
    print(f"Status: {ocr_res.get('status')}")
    print(f"Duration: {ocr_time:.3f}s across {len(pages_bgr)} page(s)")
    print(f"Normalized Text Length: {len(ocr_res.get('normalizedOCRText', ''))}")

    return {
        "fileName": os.path.basename(file_path),
        "mode": mode,
        "pageCount": len(pages_bgr),
        "preprocessingTimeSec": round(prep_time, 3),
        "ocrTimeSec": round(ocr_time, 3),
        "status": ocr_res.get("status"),
        "normalizedLength": len(ocr_res.get("normalizedOCRText", "")),
    }

def main():
    parser = argparse.ArgumentParser(description="e-Bhoomi Telugu Printed vs Handwritten OCR Benchmark Harness")
    parser.add_argument("--file", type=str, help="Path to single test document")
    parser.add_argument("--dir", type=str, help="Path to directory containing test documents")
    parser.add_argument("--mode", type=str, default="mixed", choices=["printed", "handwritten", "mixed"], help="OCR benchmark mode")
    args = parser.parse_args()

    if args.file:
        run_benchmark(args.file, args.mode)
    elif args.dir and os.path.exists(args.dir):
        files = [os.path.join(args.dir, f) for f in os.listdir(args.dir) if f.endswith(('.jpg', '.png', '.pdf'))]
        for f in files:
            run_benchmark(f, args.mode)
    else:
        print("Specify --file <path> or --dir <directory> to run benchmark.")

if __name__ == "__main__":
    main()
