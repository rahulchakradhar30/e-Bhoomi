# Phase 4 — Business Rule & Master Data Validation Engine Documentation

## 1. Objective
This document provides comprehensive technical documentation for **Phase 4: Business Rule & Master Data Validation Engine** of **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation).

Phase 4 evaluates Phase 2 AI-extracted records and Phase 3 confidence scores against administrative master data (Kurnool District 545 hierarchy: Revenue Divisions, Mandals, Villages, Secretariats) and document-type-specific business rules (`ADANGAL`, `ROR_1B`, `MUTATION`, `PARTITION_SUCCESSION`, `PATTADAR_PASSBOOK_TITLE_DEED`, `LEGACY_REVENUE_RECORD`, `UNKNOWN_OTHER`).

---

## 2. Core Architecture & Components

```
Phase 2 AI Extracted Record + Phase 3 Confidence
   │
   ▼
Validation API (POST /api/digitization/pipeline/validate -> Python POST /document-processing/validation)
   │
   ├── Master Data Resolver (MasterDataResolver / Kurnool Master Data 2025.1)
   ├── Rule Evaluators (ValidationRulesEvaluator / Stable Rule Registry)
   └── Findings Aggregator & Summary Calculator (ValidationEngine v4.0-Deterministic)
   │
   ▼
Validation Response (findings[], overallValidationStatus, versions)
   │
   ▼
AI Review UI (ExtractionReviewStep.tsx Validation Panel)
```

### Components Summary:
1. **`src/lib/digitization/validation/validationTypes.ts`**:
   - Validation interfaces (`ValidationFinding`, `ValidationResponse`, `ValidationSummary`, `MasterDataEntity`).
2. **`src/lib/digitization/validation/validationRegistry.ts`**:
   - Stable rule ID registry (`MD-DIST-001`, `MD-REV-001`, `MD-MANDAL-001`, `MD-VILLAGE-001`, `MD-SECRETARIAT-001`, `SURVEY-FMT-001`, `SURVEY-SUBDIV-001`, `EXTENT-FMT-001`, `EXTENT-VALUE-001`, `CLASSIFICATION-001`, `OWNER-PARTY-001`, `REQUIRED-ADANGAL-001`, `REQUIRED-ROR1B-001`, `CROSS-HIER-001`).
3. **`src/lib/digitization/validation/masterDataResolver.ts`**:
   - Master data access layer indexing Kurnool administrative hierarchy (`District 545` -> Revenue Divisions -> Mandals -> Villages -> Secretariats) with controlled match levels (`EXACT`, `NORMALIZED_EXACT`, `CONTROLLED_ALIAS`, `FUZZY_CANDIDATE`, `NO_MATCH`).
4. **`src/lib/digitization/validation/validationRules.ts`**:
   - Evaluator functions for hierarchy, survey format, extent bounds, land classification, owner/party consistency, required fields, and cross-field rules.
5. **`src/lib/digitization/validation/validationEngine.ts`**:
   - Coordinating validation execution, versioning (`masterDataVersion: "2025.1-Kurnool"`, `ruleSetVersion: "v4.0.0"`, `validationEngineVersion: "v4.0-Deterministic"`), findings aggregation, and document-level status calculation.
6. **`ai-service/app/validation/validation_engine.py` & `validation_router.py`**:
   - Python FastAPI endpoints (`POST /document-processing/validation` & `GET /document-processing/validation/metadata`).

---

## 3. Master Data Model & Hierarchy

Represented relationally:
```
District (e.g. Kurnool 545)
  └── Revenue Division (e.g. Adoni 545-02)
        └── Mandal (e.g. Adoni 5103)
              └── Village (e.g. Arjanapalle 600101)
                    └── Secretariat (e.g. Arjanapalle Secretariat 700101)
```

---

## 4. Rule Registry

| Rule ID | Rule Name | Category | Default Severity | Applicable Document Types |
| :--- | :--- | :--- | :--- | :--- |
| `MD-DIST-001` | District Master Data Match | `MASTER_DATA` | `ERROR` | `ALL` |
| `MD-REV-001` | Revenue Division Hierarchy Match | `MASTER_DATA` | `ERROR` | `ALL` |
| `MD-MANDAL-001` | Mandal Hierarchy Match | `MASTER_DATA` | `ERROR` | `ALL` |
| `MD-VILLAGE-001` | Village / Ward Hierarchy Match | `MASTER_DATA` | `ERROR` | `ALL` |
| `MD-SECRETARIAT-001`| Secretariat Match | `MASTER_DATA` | `WARNING` | `ALL` |
| `SURVEY-FMT-001` | Survey Number Format | `SURVEY_NUMBER` | `WARNING` | `ADANGAL`, `ROR_1B`, `MUTATION`, `PARTITION_SUCCESSION`, `PATTADAR_PASSBOOK_TITLE_DEED`, `LEGACY_REVENUE_RECORD` |
| `SURVEY-SUBDIV-001` | Sub-Division Consistency | `SURVEY_NUMBER` | `INFO` | `ALL` |
| `EXTENT-FMT-001` | Extent Format & Unit | `EXTENT` | `WARNING` | `ADANGAL`, `ROR_1B`, `MUTATION`, `PARTITION_SUCCESSION`, `PATTADAR_PASSBOOK_TITLE_DEED` |
| `EXTENT-VALUE-001` | Extent Non-Negative Range | `EXTENT` | `ERROR` | `ALL` |
| `CLASSIFICATION-001`| Land Classification Check | `LAND_CLASSIFICATION` | `WARNING` | `ADANGAL`, `ROR_1B`, `PATTADAR_PASSBOOK_TITLE_DEED` |
| `OWNER-PARTY-001` | Owner/Party Consistency | `OWNER_PARTY` | `WARNING` | `ALL` |
| `REQUIRED-ADANGAL-001`| Adangal Required Fields | `REQUIRED_FIELD` | `ERROR` | `ADANGAL` |
| `REQUIRED-ROR1B-001`| RoR-1B Required Fields | `REQUIRED_FIELD` | `ERROR` | `ROR_1B` |
| `CROSS-HIER-001` | Cross-Field Hierarchy Check | `CROSS_FIELD` | `ERROR` | `ALL` |

---

## 5. Severity Model & Status Calculation
- **Finding Severities**: `INFO`, `WARNING`, `ERROR`, `CRITICAL`.
- **Finding Statuses**: `PASS`, `WARNING`, `ERROR`, `UNVERIFIED`, `NOT_APPLICABLE`.
- **Overall Document Status Logic**:
  - Any `CRITICAL` or `ERROR` findings -> **`FAILED`** (`reviewPriority: HIGH`).
  - Any `WARNING` or `UNVERIFIED` findings -> **`REVIEW_REQUIRED`** (`reviewPriority: MEDIUM`).
  - All applicable rules pass -> **`PASS`** (`reviewPriority: LOW`).

---

## 6. Important Distinction: Confidence vs Validation
- **AI Confidence**: Evaluates extraction probability (e.g. `confidence: 0.95`).
- **Validation**: Evaluates conformity against administrative master data and business rules.
- **Rule**: High AI confidence (`0.95`) does NOT force an unverified master-data lookup into a `PASS`. A field can have `confidence: HIGH` and `validation: UNVERIFIED` simultaneously.

---

## 7. Versioning & Auditability
Every validation output records immutable version metadata:
- `masterDataVersion`: `"2025.1-Kurnool"`
- `ruleSetVersion`: `"v4.0.0"`
- `validationEngineVersion`: `"v4.0-Deterministic"`

---

## 8. Test Scenarios Summary
Executed 10 deterministic test scenarios via `python scripts/benchmark_validation.py` with 100% accuracy across hierarchy checks, survey formatting, missing required fields, historical administrative names, and real `ADANGAL` / `ROR_1B` pipeline inputs.
