# e-Bhoomi — Phase 3: Field-Level Confidence Scoring + Source Evidence + Traceability

## Overview
Phase 3 implements a dedicated **Field-Level Confidence Scoring, Source Evidence, Traceability, and Review Prioritization Engine** for **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation), building upon Phase 2 AI/NLP Structured Land Record Extraction. It calculates normalized field confidence (`0.0`–`1.0`), binds extracted fields to original source text, page numbers, and bounding-box region coordinates, detects evidence conflicts, and prioritizes human VRO review without making unverified legal assertions.

---

## 1. Dedicated Confidence Engine Architecture (`ConfidenceEngine`)
The confidence engine operates server-side, evaluating multi-signal extraction fidelity without hardcoding artificial static scores:

```
               Phase 2 Structured Extraction Result
                                 │
                                 ▼
                         ConfidenceEngine
    (Multi-Signal Scoring, Evidence Binding, Conflict Detection)
                                 │
                                 ▼
                     Field & Document Confidence
                                 │
                                 ▼
                     VRO Review Prioritization
```

---

## 2. Normalized Score Representation & Explicit Score Sources
- **Canonical Scale**: Scores are stored internally as normalized floats between `0.0` and `1.0` (e.g. `0.92`, `0.61`). The UI formats these for display (e.g. `92%`, `61%`).
- **Explicit Score Sources**:
  - `MODEL_PROVIDED`: Direct model confidence score.
  - `RULE_DERIVED`: Score derived from structural extraction rules.
  - `EVIDENCE_DERIVED`: Score calculated from direct text alignment in document corpus.
  - `HEURISTIC`: Heuristic calculation.
  - `UNAVAILABLE`: Set when no trustworthy signals exist (zero fabrication policy).

---

## 3. Multi-Signal Scoring Inputs
Where available, the engine evaluates:
1. **Document Quality Diagnostics**: Blur, skew, low contrast, or noise signals from Phase 1A.
2. **OCR & Handwriting Quality**: Printed vs handwritten text region metadata from Phase 1B/1C.
3. **Dual-Language Source Agreement**: Cross-verification between Telugu source text (`nlpProcessedText`) and English translation (`translatedText`).
4. **Multi-Page Field Repetition**: Independent agreement across multiple document pages.
5. **Candidate Conflict Detection**: Disagreements between candidates across pages.

---

## 4. End-to-End Source Evidence & Traceability Chain

Every extracted field retains an evidence array linking it back to the original document:
```
Final AI Field  ──▶  Extraction Candidate  ──▶  Source Text  ──▶  Source Region  ──▶  Source Page  ──▶  Original Document Scan
```

### Evidence Schema
```json
{
  "pageNumber": 1,
  "regionId": "reg-surveyNumber-01",
  "boundingBox": {
    "x": 50,
    "y": 100,
    "width": 300,
    "height": 40
  },
  "sourceText": "సర్వే నంబరు 142/3A",
  "translatedText": "Survey Number: 142/3A",
  "evidenceType": "NLP_TEXT"
}
```

---

## 5. Conflict & Multi-Candidate Detection
If conflicting values are detected across pages (e.g. Page 1: `142/3A` vs Page 3: `142/3B`), the engine:
- Retains both values in the `candidates` array.
- Assigns field status `CONFLICT` and review priority `HIGH`.
- Prevents high document average scores from masking critical field conflicts.

---

## 6. Document-Level Review Priority Aggregation
Document review priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) is calculated using weighted critical field aggregation (`ownerName`, `surveyNumber`, `extent`, `district`, `mandal`, `village`). A conflict in a critical field automatically elevates the document priority to `CRITICAL` or `HIGH`.

---

## 7. Traceable Response Schema

```json
{
  "confidenceJobId": "CONF-1741123456",
  "status": "CONFIDENCE_COMPLETED",
  "engineVersion": "v3.0-MultiSignalTraceability",
  "thresholdConfig": {
    "highThreshold": 0.85,
    "mediumThreshold": 0.65
  },
  "documentSummary": {
    "overallConfidenceScore": 0.88,
    "overallReviewPriority": "LOW",
    "totalFieldsEvaluated": 8,
    "highConfidenceFieldsCount": 7,
    "lowConfidenceFieldsCount": 1,
    "conflictFieldsCount": 0,
    "missingEvidenceFieldsCount": 0,
    "criticalFieldsRequiringReview": [],
    "reviewRecommendation": "High confidence extraction. Standard verification recommended."
  },
  "fieldsConfidence": {
    "surveyNumber": {
      "fieldName": "surveyNumber",
      "value": "142/3A",
      "score": 0.95,
      "scoreSource": "EVIDENCE_DERIVED",
      "status": "HIGH_CONFIDENCE",
      "reviewPriority": "LOW",
      "evidence": [
        {
          "pageNumber": 1,
          "regionId": "reg-surveyNumber-01",
          "boundingBox": {"x": 50, "y": 100, "width": 300, "height": 40},
          "sourceText": "సర్వే నంబరు: 142/3A",
          "translatedText": "Survey Number: 142/3A",
          "evidenceType": "NLP_TEXT"
        }
      ],
      "candidates": [
        {"value": "142/3A", "score": 0.95, "source": "Primary Extraction"}
      ],
      "explanation": "Direct evidence found in document text. Dual-language source agreement (Telugu + English)."
    }
  },
  "extractionId": "EXTRACT-1741123456",
  "overallStatus": "READY_FOR_VALIDATION",
  "evaluatedAt": "2026-09-03T22:23:00Z",
  "processingTimeMs": 25
}
```

---

## 8. Developer Evaluation Script (`scripts/benchmark_confidence.py`)
Run confidence evaluations:
```bash
python scripts/benchmark_confidence.py
```
Measures score calculation speed, evidence links, conflict detection, and review priority assignment.

---

## 9. Next Integration Point (Phase 4 / Business Validation Engine)
At the conclusion of Phase 3, the document package carries status `READY_FOR_VALIDATION`. The downstream Business Rule & Master Data Validation Engine will consume this evidence-backed structured JSON package in Phase 4.
