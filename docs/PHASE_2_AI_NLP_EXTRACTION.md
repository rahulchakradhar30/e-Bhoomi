# e-Bhoomi — Phase 2: AI/NLP Structured Land Record Extraction

## Overview
Phase 2 implements the first **REAL AI/NLP Semantic Document Extraction Layer** for **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation), converting the Phase 1 dual-language OCR/NLP/translation artifacts (`rawOCRText`, `normalizedOCRText`, `nlpProcessedText`, `translatedText`, page numbers, region metadata) into a document-aware, structured land-record JSON representation.

---

## 1. AI Extraction Provider Architecture (`BaseAIExtractionProvider`)
Phase 2 establishes a pluggable provider abstraction to decouple AI document understanding models from downstream UI and storage layers:

```
             BaseAIExtractionProvider (Abstract Interface)
                                  │
                                  ▼
                        AIExtractionProvider
    (Document Understanding, Dual-Language Reasoning, NER & Schema Registry)
```

---

## 2. Document Schema Registry (`DocumentSchemaRegistry`)
Configures specific extraction rules and field lists across 6 official land record categories plus `UNKNOWN_OTHER`:
1. **`ADANGAL`**: Adangal / Pahani Village Account No. 3.
2. **`ROR_1B`**: Record of Rights (1B).
3. **`MUTATION`**: Mutation Document / Title Transfer.
4. **`PARTITION_SUCCESSION`**: Land Partition & Inheritance Records.
5. **`PATTADAR_PASSBOOK_TITLE_DEED`**: Pattadar Passbook / Title Deed.
6. **`LEGACY_REVENUE_RECORD`**: Historical Revenue Records.
7. **`UNKNOWN_OTHER`**: Unspecified Land Record Documents.

---

## 3. Common Land-Record Schema & Relationship Models

### Common Land Fields
- `ownerName`, `fatherOrHusbandName`, `relationship`, `surveyNumber`, `subDivisionNumber`, `khasraNumber`, `khataNumber`, `extent`, `landClassification`, `district`, `revenueDivision`, `mandal`, `village`, `documentDate`, `registrationDate`, `mutationReference`, `registrationNumber`.

### Boundary Schema (`boundaries`)
- `east`, `west`, `north`, `south`. (Returns `null` if unmentioned; zero hallucination).

### Parties & Relationships (`parties`)
- Supports joint ownership, seller/buyer transactions, and father → multiple sons inheritance/partition:
```json
"parties": [
  {
    "partyId": "PARTY-1",
    "name": "కె. రామారావు",
    "role": "PRIMARY_PATTADAR",
    "relationship": "TITLE_HOLDER",
    "share": "100%",
    "extent": "2.45 Acres"
  }
]
```

### Unmapped Fields (`unmappedFields`)
- Preserves historical revenue terms without violating JSON schema validation.

---

## 4. Zero Hallucination & Strict Preservation Policy

> [!IMPORTANT]
> **Strict Extraction Rules**:
> 1. **Zero Hallucination**: Unextracted or absent fields return `null` or `"Not available"`. Equal shares or fake names are NEVER fabricated.
> 2. **Numerical Fidelity**: Survey numbers (`142/3A`), extents (`2.45`), khata numbers (`482`), dates (`15.06.2004`), and personal owner names are preserved **EXACTLY** without alteration.

---

## 5. Traceable Structured JSON Output Schema

```json
{
  "extractionId": "EXTRACT-1741123456",
  "status": "AI_EXTRACTION_COMPLETED",
  "provider": "AIExtractionProvider",
  "modelVersion": "eBhoomi-LandRecord-NER-v2.0",
  "promptVersion": "v2.1-StructuredJSON",
  "schemaVersion": "2.0.0",
  "documentType": "ADANGAL",
  "documentTypeName": "Adangal / Pahani",
  "aiExtractedRecord": {
    "ownerName": "కె. రామారావు",
    "fatherOrHusbandName": "సుబ్బారావు",
    "relationship": "S/o",
    "surveyNumber": "142",
    "subDivisionNumber": "3A",
    "khasraNumber": null,
    "khataNumber": "482",
    "extent": "2.45 Acres",
    "landClassification": "Agricultural",
    "district": "కర్నూలు",
    "revenueDivision": null,
    "mandal": "అడోని",
    "village": "ఆర్జనపల్లె",
    "documentDate": null,
    "registrationDate": null,
    "mutationReference": null,
    "registrationNumber": null
  },
  "boundaries": {
    "east": "రోడ్డు",
    "west": "కాలువ",
    "north": null,
    "south": null
  },
  "parties": [
    {
      "partyId": "PARTY-1",
      "name": "కె. రామారావు",
      "role": "PRIMARY_PATTADAR",
      "relationship": "TITLE_HOLDER",
      "share": "100%",
      "extent": null
    }
  ],
  "unmappedFields": [],
  "sourceReferences": [
    {
      "pageNumber": 1,
      "status": "COMPLETED",
      "hasRegions": true
    }
  ],
  "overallStatus": "READY_FOR_CONFIDENCE_AND_VALIDATION",
  "extractedAt": "2026-09-03T22:17:00Z",
  "processingTimeMs": 45
}
```

---

## 6. Developer Evaluation Script (`scripts/benchmark_extraction.py`)
Run extraction evaluations:
```bash
python scripts/benchmark_extraction.py --doc-type ADANGAL
```
Measures extraction precision, party/boundary extraction, and processing speed across land record categories.

---

## 7. Next Integration Point (Phase 3 / Confidence Engine & Validation)
At the conclusion of Phase 2, the document package carries status `READY_FOR_CONFIDENCE_AND_VALIDATION`. The downstream Confidence Scoring Engine and Business Rule Validation Engine will consume this structured JSON package.
