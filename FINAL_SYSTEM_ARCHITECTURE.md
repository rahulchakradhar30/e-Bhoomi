# e-Bhoomi — Final System Architecture Documentation
SIH26018 — Intelligent Land Record Digitization & Validation

## 1. Problem Statement & Executive Architecture
e-Bhoomi is an intelligent end-to-end land record digitization and validation system designed for India's revenue administration. It addresses scanned printed/handwritten Telugu & English revenue documents (Adangal, RoR-1B, Mutation notices, Partition deeds) through computer vision, OCR, Indic NLP, IndicTrans2 translation, schema-constrained AI extraction, business validation, cross-database verification, human-in-the-loop VRO verification, and tamper-evident audit logging.

---

## 2. Complete End-to-End Pipeline Architecture

```
Scanned PDF / Image Upload
        │
        ▼
Phase 1A: Server-Side OpenCV Pre-processing (Deskew, Denoise, Contrast & Quality Diagnostics)
        │
        ▼
Phase 7: Language & Document Classification (LanguageDetector: Telugu / English / Mixed / Unknown)
        │
        ▼
Phase 7: Unified Multilingual OCR Router (UnifiedOCRRouter)
        ├── Telugu Printed  ──► TeluguOCRProvider
        ├── Telugu Cursive  ──► TeluguHandwrittenOCRProvider
        └── English Printed ──► EnglishOCRProvider
        │
        ▼
Phase 1D: Server-Side Indic NLP & Terminology Standardization (IndicNLPService)
        │
        ▼
Phase 1E: Server-Side Telugu ↔ English Neural Translation (IndicTrans2Provider)
        │
        ▼
Phase 2 & 7: Server-Side AI Structured Schema Extraction (ConfiguredAIProvider / Schema Grounding)
        │
        ▼
Phase 3: Field-Level Confidence Scoring & Traceability (ConfidenceEngine / Page Evidence Bounding)
        │
        ▼
Phase 4: Business Rule & Master Data Validation Engine (ValidationEngine / Kurnool 545 Hierarchy)
        │
        ▼
Phase 5: Cross-Database Verification & Duplicate/Conflict Engine (CrossDatabaseVerificationEngine)
        ├── AP LRMS Adapter (LRMSProvider)
        ├── DILRMP Adapter (DILRMPProvider)
        ├── Duplicate Detector (DuplicateDetectionEngine)
        └── Conflict Detector (ConflictDetectionEngine)
        │
        ▼
Phase 6: VRO Decision Workspace & Immutable Audit Ledger (VerificationManager / AuditLedgerEngine)
        ├── Field-Level Accept / Correct (with Controlled Reason Codes)
        ├── Tamper-Evident Event Chaining (sha256 Hash Chaining)
        └── Workflow State Machine (DRAFT -> VRO_REVIEW -> FINALIZED)
        │
        ▼
Phase 6 & 7: Real Operational Analytics & Quality Metrics (AnalyticsService)
```

---

## 3. Key Subsystems & Design Principles

1. **Universal Language Detection & Multilingual Processing**:
   - Documents are classified into `TELUGU`, `ENGLISH`, `MIXED_TE`, or `UNKNOWN`.
   - English documents bypass translation, avoiding information loss.
   - Telugu documents preserve original Telugu script alongside normalized English representations.
2. **Zero Fake Data & Honest API Responses**:
   - Unconfigured government base URLs or missing AI credentials honestly return `UNAVAILABLE` or `AI_PROVIDER_UNAVAILABLE`. No fake land records or synthetic responses are injected into live workflows.
3. **Immutability of AI Output**:
   - `aiExtractedRecord` remains 100% immutable. Corrections are logged in `correctionHistory` and stored in `VerifiedLandRecord`.
4. **Append-Only Tamper-Evident Audit Ledger**:
   - Audit events are cryptographically linked using `sha256(previousEventHash + payload)`.
