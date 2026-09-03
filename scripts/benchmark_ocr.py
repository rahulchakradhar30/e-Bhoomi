#!/usr/bin/env python3
"""
e-Bhoomi — Phase 1B: Telugu OCR Benchmark & Performance Evaluation Script
Usage:
    python scripts/benchmark_ocr.py --input-dir test-docs/ --model harsha-desaraju/telugu-ocr-model
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
from app.ocr.normalizer import TeluguNormalizer

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

def run_benchmark(file_path: str, provider: TeluguOCRProvider) -> Dict[str, Any]:
    print(f"\n==================================================")
    print(f"BENCHMARKING FILE: {os.path.basename(file_path)}")
    print(f"==================================================")

    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return {}

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # 1. OpenCV Preprocessing Step
    preprocessor = DocumentPreprocessor()
    prep_start = time.time()
    pages_bgr = preprocessor._extract_pages_as_images(file_bytes, "application/pdf" if file_path.endswith(".pdf") else "image/jpeg")
    prep_time = time.time() - prep_start

    print(f"[Phase 1A Preprocessing] Rendered {len(pages_bgr)} page(s) in {prep_time:.3f}s")

    # 2. Telugu OCR Step
    ocr_start = time.time()
    ocr_res = provider.process_document_images(pages_bgr)
    ocr_time = time.time() - ocr_start

    print(f"[Phase 1B Telugu OCR] Provider: {ocr_res.get('provider')}")
    print(f"Model: {ocr_res.get('model')}")
    print(f"Device: {ocr_res.get('device')}")
    print(f"Status: {ocr_res.get('status')}")
    print(f"OCR Duration: {ocr_time:.3f}s across {len(pages_bgr)} page(s)")
    print(f"Extracted Character Count: {len(ocr_res.get('normalizedOCRText', ''))}")

    return {
        "fileName": os.path.basename(file_path),
        "pageCount": len(pages_bgr),
        "preprocessingTimeSec": round(prep_time, 3),
        "ocrTimeSec": round(ocr_time, 3),
        "status": ocr_res.get("status"),
        "rawLength": len(ocr_res.get("rawOCRText", "")),
        "normalizedLength": len(ocr_res.get("normalizedOCRText", "")),
    }

def main():
    parser = argparse.ArgumentParser(description="e-Bhoomi Telugu OCR Benchmark Harness")
    parser.add_argument("--file", type=str, help="Path to single test document")
    parser.add_argument("--dir", type=str, help="Path to directory containing test documents")
    args = parser.parse_args()

    provider = TeluguOCRProvider()
    print("Provider Metadata:", provider.get_provider_metadata())

    if args.file:
        run_benchmark(args.file, provider)
    elif args.dir and os.path.exists(args.dir):
        files = [os.path.join(args.dir, f) for f in os.listdir(args.dir) if f.endswith(('.jpg', '.png', '.pdf'))]
        for f in files:
            run_benchmark(f, provider)
    else:
        print("Specify --file <path> or --dir <directory> to run benchmark.")

if __name__ == "__main__":
    main()
