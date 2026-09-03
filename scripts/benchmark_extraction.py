#!/usr/bin/env python3
"""
e-Bhoomi — Phase 2: AI/NLP Structured Land Record Extraction Evaluation Script
Usage:
    python scripts/benchmark_extraction.py --doc-type ADANGAL
"""

import os
import sys
import time
import argparse
from typing import Dict, Any

# Add ai-service to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-service"))

from app.extraction.ai_extraction_provider import AIExtractionProvider
from app.extraction.schema_registry import DocumentSchemaRegistry

def run_extraction_benchmark(doc_type: str, corpus: str) -> Dict[str, Any]:
    print(f"\n==================================================")
    print(f"BENCHMARKING AI/NLP EXTRACTION [DOCUMENT TYPE: {doc_type}]")
    print(f"==================================================")

    provider = AIExtractionProvider()
    schema = DocumentSchemaRegistry.get_schema(doc_type)
    print("Schema Category:", schema["category"])
    print("Schema Supported Fields:", schema["fields"])

    mock_input = {
        "rawOCRText": corpus,
        "normalizedOCRText": corpus,
        "nlpProcessedText": corpus,
        "translatedText": "Government of Andhra Pradesh Revenue Record.\nOwner Name: K. Rama Rao, Father: Subba Rao.\nSurvey Number: 142/3A, Extent: 2.45 Acres, Khata No: 482.\nVillage: Arjanapalle, Mandal: Adoni, District: Kurnool.",
        "pages": [{"pageNumber": 1, "status": "COMPLETED", "regions": []}]
    }

    start = time.time()
    res = provider.extract_structured_land_record(mock_input, doc_type)
    duration = time.time() - start

    extracted = res.get("aiExtractedRecord", {})
    print(f"[Extraction Result] Status: {res.get('status')}")
    print(f"Owner Name: {extracted.get('ownerName')}")
    print(f"Survey Number: {extracted.get('surveyNumber')}")
    print(f"Extent: {extracted.get('extent')}")
    print(f"Khata Number: {extracted.get('khataNumber')}")
    print(f"Village: {extracted.get('village')}")
    print(f"Parties Extracted: {len(res.get('parties', []))}")
    print(f"Boundaries Extracted: {res.get('boundaries')}")
    print(f"Duration: {duration:.4f}s")

    return {
        "documentType": doc_type,
        "status": res.get("status"),
        "fieldsExtracted": sum(1 for v in extracted.values() if v is not None),
        "partiesCount": len(res.get("parties", [])),
        "durationSec": round(duration, 4),
    }

def main():
    parser = argparse.ArgumentParser(description="e-Bhoomi Phase 2 AI Extraction Evaluation")
    parser.add_argument("--doc-type", type=str, default="ADANGAL", help="Document type code")
    args = parser.parse_args()

    sample_corpus = (
        "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు (అడంగల్)\n"
        "జిల్లా: కర్నూలు, మండలం: అడోని, గ్రామము: ఆర్జనపల్లె\n"
        "ఖాతా నంబరు: 482, సర్వే నంబరు: 142/3A, విస్తీర్ణము: 2.45 ఎకరాలు\n"
        "పట్టాదారు పేరు: కె. రామారావు, తండ్రి: సుబ్బారావు\n"
        "తూర్పు: రోడ్డు, పడమర: కాలువ"
    )
    run_extraction_benchmark(args.doc_type, sample_corpus)

if __name__ == "__main__":
    main()
