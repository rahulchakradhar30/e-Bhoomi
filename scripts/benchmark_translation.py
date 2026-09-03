#!/usr/bin/env python3
"""
e-Bhoomi — Phase 1E: IndicTrans2 Telugu <-> English Translation Benchmark Script
Usage:
    python scripts/benchmark_translation.py --file test-docs/nlp_sample.json
"""

import os
import sys
import time
import argparse
from typing import Dict, Any

# Add ai-service to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-service"))

from app.translation.indic_trans2_provider import IndicTrans2Provider

def run_translation_benchmark(text: str) -> Dict[str, Any]:
    print(f"\n==================================================")
    print(f"BENCHMARKING INDICTRANS2 TRANSLATION [TELUGU -> ENGLISH]")
    print(f"==================================================")

    provider = IndicTrans2Provider()
    print("Provider Metadata:", provider.get_provider_metadata())

    start = time.time()
    res = provider.translate_text(text, "te", "en")
    duration = time.time() - start

    print(f"[IndicTrans2 Result] Status: {res.get('status')}")
    print(f"Source Text Length: {len(text)} chars")
    print(f"Translated Length: {len(res.get('translatedText', ''))} chars")
    print(f"Duration: {duration:.4f}s")
    print("\n--- TELUGU SOURCE ---")
    print(text)
    print("\n--- ENGLISH TRANSLATION ---")
    print(res.get("translatedText", "[No Translation Output]"))

    return {
        "sourceLength": len(text),
        "targetLength": len(res.get("translatedText", "")),
        "status": res.get("status"),
        "durationSec": round(duration, 4),
    }

def main():
    parser = argparse.ArgumentParser(description="e-Bhoomi IndicTrans2 Translation Benchmark")
    parser.add_argument("--text", type=str, help="Single line of text to translate")
    args = parser.parse_args()

    sample_text = args.text or (
        "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు. "
        "జిల్లా: కర్నూలు, మండలం: అడోని, గ్రామము: ఆర్జనపల్లె. "
        "ఖాతా నంబరు: 482, సర్వే నంబరు: 142/3A, విస్తీర్ణము: 2.45 ఎకరాలు. "
        "పట్టాదారు పేరు: కె. రామారావు, వారసత్వము: సుబ్బారావు."
    )
    run_translation_benchmark(sample_text)

if __name__ == "__main__":
    main()
