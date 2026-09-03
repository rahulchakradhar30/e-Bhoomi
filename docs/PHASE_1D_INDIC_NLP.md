# e-Bhoomi — Phase 1D: Indic NLP Integration

## Overview
Phase 1D integrates the **Indic NLP Library** as the language-processing and normalization layer for **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation), building upon Phase 1A (OpenCV Preprocessing), Phase 1B (Printed Telugu OCR), and Phase 1C (Telugu Handwritten OCR & Region Routing). It prepares OCR-extracted Telugu and multilingual text for downstream translation and AI land-field extraction while preserving land record terminology, survey numbers, owner names, and document metadata.

---

## 1. Indic NLP Library Source & License Verification
- **Official Repository**: [anoopkunchukuttan/indic_nlp_library](https://github.com/anoopkunchukuttan/indic_nlp_library)
- **PyPI Package**: `indic-nlp-library` (v0.2.0+)
- **License**: **MIT License** (Free for open source, commercial, and government deployment).

---

## 2. Integrated NLP Components & Service Architecture (`IndicNLPService`)
- **Unicode Normalization (`indic_nlp.normalize`)**: Applies safe Indic Unicode character normalization without altering Telugu character semantics or line breaks.
- **Indic Tokenization (`indic_nlp.tokenize.indic_tokenize`)**: Tokenizes text preserving alphanumeric combinations, punctuation, slashes (`/`), and hyphens (`-`).
- **Sentence Segmentation (`indic_nlp.tokenize.sentence_tokenize`)**: Segments multi-line OCR text into logical sentences while preserving page and region references.

---

## 3. Strict Number & Name Preservation Rules

> [!IMPORTANT]
> **Zero Name & Number Alteration Policy**:
> 1. **Land Identifiers & Numerals**: Numbers such as survey numbers (`142/3A`, `42-A`), extents (`2.45`), khata numbers (`482`), dates (`15.06.2004`), and years are preserved **EXACTLY** as extracted by OCR.
> 2. **Personal Owner Names**: Personal names (e.g. `కె. రామారావు`) are NEVER dictionary-corrected, transliterated, or rewritten.

---

## 4. Land Record Terminology & Custom Glossary Architecture (`LandRecordGlossary`)
Phase 1D establishes an extensible, non-destructive terminology layer (`ai-service/app/nlp/glossary.py`):

| Telugu Term | Category | Normalized Form | English Reference |
|---|---|---|---|
| అడంగల్ | `DOCUMENT_TYPE` | Adangal | Village Account No. 3 |
| హక్కుల పత్రము | `DOCUMENT_TYPE` | RoR-1B | Record of Rights (1B) |
| పట్టాదారు | `OWNERSHIP` | Pattadar | Title Holder |
| ఖాతా | `IDENTIFIER` | Khata Number | Account / Khata Number |
| సర్వే నంబరు | `IDENTIFIER` | Survey Number | Survey Number |
| విస్తీర్ణము | `MEASUREMENT` | Extent | Land Extent (Acres/Cents) |
| మండలము | `JURISDICTION` | Mandal | Revenue Mandal |
| జిల్లా | `JURISDICTION` | District | Revenue District |

---

## 5. Traceable Three-Layer Output Schema
The system maintains 3 distinct, non-destructive text layers:
1. `rawOCRText`: Original neural OCR output.
2. `normalizedOCRText`: Phase 1B/1C NFKC output.
3. `nlpProcessedText`: Phase 1D Indic NLP tokenized & segmented output.

```json
{
  "nlpJobId": "NLP-1741123456",
  "status": "NLP_COMPLETED",
  "provider": "IndicNLPService",
  "libraryVersion": "indic-nlp-library v0.2.0",
  "detectedLanguages": ["te", "en"],
  "pageCount": 1,
  "pages": [
    {
      "pageNumber": 1,
      "status": "COMPLETED",
      "rawOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
      "normalizedOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
      "nlpProcessedText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
      "tokensCount": 7,
      "sentences": [
        "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు",
        "సర్వే నంబరు: 142/3A"
      ],
      "glossaryHits": [
        {
          "term": "సర్వే నంబరు",
          "category": "IDENTIFIER",
          "normalizedForm": "Survey Number",
          "englishReference": "Survey Number"
        }
      ]
    }
  ],
  "rawOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
  "normalizedOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
  "nlpProcessedText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
  "overallStatus": "READY_FOR_TRANSLATION",
  "processedAt": "2026-09-03T22:00:00Z",
  "processingTimeMs": 15
}
```

---

## 6. Developer Benchmark Script (`scripts/benchmark_nlp.py`)
Run NLP preprocessing performance evaluations:
```bash
python scripts/benchmark_nlp.py --file test-docs/ocr_sample.txt
```
Measures processing speed, input vs output character counts, token counts, and glossary term hits.

---

## 7. Next Integration Point (Phase 1E / Translation)
Upon completion of Phase 1D, the document package carries status `READY_FOR_TRANSLATION`. IndicTrans2 (Telugu → English translation) will consume this normalized language representation in Phase 1E.
