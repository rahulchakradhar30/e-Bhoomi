#!/usr/bin/env python3
"""
e-Bhoomi — Phase 1D: Indic NLP Preprocessing Benchmark Script
Usage:
    python scripts/benchmark_nlp.py --file test-docs/ocr_sample.txt
"""

import os
import sys
import time
import argparse
from typing import Dict, Any

# Add ai-service to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-service"))

from app.nlp.indic_nlp_service import IndicNLPService
from app.nlp.glossary import LandRecordGlossary

def run_nlp_benchmark(file_path: str) -> Dict[str, Any]:
    print(f"\n==================================================")
    print(f"BENCHMARKING INDIC NLP FILE: {os.path.basename(file_path)}")
    print(f"==================================================")

    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return {}

    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    nlp_service = IndicNLPService()
    start = time.time()
    res = nlp_service.process_text(text, "te")
    duration = time.time() - start

    print(f"[Indic NLP Result] Provider: IndicNLPService")
    print(f"Indic NLP Available: {nlp_service.indic_nlp_available}")
    print(f"Input Length: {len(text)} chars")
    print(f"NLP Output Length: {len(res.get('nlpProcessedText', ''))} chars")
    print(f"Tokens Count: {len(res.get('tokens', []))}")
    print(f"Sentences Count: {len(res.get('sentences', []))}")
    print(f"Glossary Term Hits: {len(res.get('glossaryHits', []))}")
    print(f"Detected Languages: {res.get('detectedLanguages', [])}")
    print(f"Duration: {duration:.4f}s")

    return {
        "fileName": os.path.basename(file_path),
        "inputLength": len(text),
        "outputLength": len(res.get("nlpProcessedText", "")),
        "tokenCount": len(res.get("tokens", [])),
        "sentenceCount": len(res.get("sentences", [])),
        "glossaryHits": len(res.get("glossaryHits", [])),
        "durationSec": round(duration, 4),
    }

def main():
    parser = argparse.ArgumentParser(description="e-Bhoomi Indic NLP Preprocessing Benchmark")
    parser.add_argument("--file", type=str, help="Path to text file containing OCR output")
    args = parser.parse_args()

    if args.file:
        run_nlp_benchmark(args.file)
    else:
        # Default sample Telugu land record text
        sample_text = (
            "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\n"
            "జిల్లా: కర్నూలు, మండలం: అడోని, గ్రామము: ఆర్జనపల్లె\n"
            "ఖాతా నంబరు: 482, సర్వే నంబరు: 142/3A, విస్తీర్ణము: 2.45 ఎకరాలు\n"
            "పట్టాదారు పేరు: కె. రామారావు, వారసత్వము: సుబ్బారావు"
        )
        print("Running default sample benchmark...")
        nlp_service = IndicNLPService()
        res = nlp_service.process_text(sample_text, "te")
        print("Sample NLP Result Tokens Count:", len(res["tokens"]))
        print("Glossary Hits:", [h["term"] for h in res["glossaryHits"]])

if __name__ == "__main__":
    main()
