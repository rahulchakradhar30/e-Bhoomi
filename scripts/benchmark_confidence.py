#!/usr/bin/env python3
"""
e-Bhoomi — Phase 3: Field-Level Confidence, Evidence & Traceability Evaluation Script
Usage:
    python scripts/benchmark_confidence.py
"""

import os
import sys
import time
from typing import Dict, Any

# Add ai-service to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-service"))

from app.confidence.confidence_engine import ConfidenceEngine

def run_confidence_benchmark() -> Dict[str, Any]:
    print(f"\n==================================================")
    print(f"BENCHMARKING FIELD-LEVEL CONFIDENCE & SOURCE EVIDENCE")
    print(f"==================================================")

    engine = ConfidenceEngine(high_threshold=0.85, medium_threshold=0.65)

    sample_extraction = {
        "extractionId": "EXTRACT-SAMPLE-101",
        "rawOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nపట్టాదారు: కె. రామారావు, సర్వే నంబరు: 142/3A",
        "nlpProcessedText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nపట్టాదారు: కె. రామారావు, సర్వే నంబరు: 142/3A",
        "translatedText": "Government of Andhra Pradesh Revenue Record\nOwner Name: K. Rama Rao, Survey Number: 142/3A",
        "aiExtractedRecord": {
            "ownerName": "కె. రామారావు",
            "fatherOrHusbandName": "సుబ్బారావు",
            "surveyNumber": "142/3A",
            "extent": "2.45 Acres",
            "khataNumber": "482",
            "village": "ఆర్జనపల్లె",
            "mandal": "అడోని",
            "district": "కర్నూలు"
        },
        "boundaries": {
            "east": "రోడ్డు",
            "west": "కాలువ",
            "north": None,
            "south": None
        },
        "sourceReferences": [{"pageNumber": 1, "status": "COMPLETED"}]
    }

    start = time.time()
    res = engine.evaluate_extraction_confidence(sample_extraction)
    duration = time.time() - start

    doc_sum = res.get("documentSummary", {})
    print(f"[Confidence Result] Overall Score: {doc_sum.get('overallConfidenceScore')}")
    print(f"Overall Review Priority: {doc_sum.get('overallReviewPriority')}")
    print(f"Total Fields Evaluated: {doc_sum.get('totalFieldsEvaluated')}")
    print(f"High Confidence Fields: {doc_sum.get('highConfidenceFieldsCount')}")
    print(f"Low Confidence Fields: {doc_sum.get('lowConfidenceFieldsCount')}")
    print(f"Conflict Fields: {doc_sum.get('conflictFieldsCount')}")
    print(f"Review Recommendation: {doc_sum.get('reviewRecommendation')}")
    print(f"Duration: {duration:.4f}s")

    return {
        "overallScore": doc_sum.get("overallConfidenceScore"),
        "reviewPriority": doc_sum.get("overallReviewPriority"),
        "durationSec": round(duration, 4),
    }

def main():
    run_confidence_benchmark()

if __name__ == "__main__":
    main()
