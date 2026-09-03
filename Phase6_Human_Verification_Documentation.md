# Phase 6 — Human Verification, Audit Ledger & Operational Analytics Documentation

## 1. Objective
This document provides technical documentation for **Phase 6: Human Verification, Audit Ledger & Operational Analytics** of **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation).

Phase 6 turns the complete AI-extracted, validated, and cross-verified digitization pipeline into an operational human-in-the-loop workflow with field-level acceptance/correction, controlled reason logging, append-only audit event chaining, state machine workflow routing, and real-time operational analytics.

---

## 2. Core Architecture & Components

```
AI Extracted Record + Validation + Cross-Verification Output
   │
   ▼
VRO Decision Workspace (ExtractionReviewStep.tsx)
   │
   ├── Field Acceptance / Field Correction (with Controlled Reason Selector)
   ├── Append-Only Tamper-Evident Audit Ledger (AuditLedgerEngine / sha256 Chaining)
   ├── Workflow State Machine (WorkflowStateMachine)
   ├── Verification Manager (VerificationManager / VerifiedLandRecord Model)
   └── Operational Analytics Service (AnalyticsService / Real Audit Metrics)
   │
   ▼
Verified Record Creation + Finalization Locking
```

---

## 3. Immutability of Raw AI Output & Verified Record Model

### Core Rule:
`aiExtractedRecord` remains 100% immutable after extraction. Field corrections never overwrite original AI outputs; they update `verifiedFields` in `VerifiedLandRecord` and append entries to `correctionHistory`.

### VerifiedLandRecord Schema:
```typescript
interface VerifiedLandRecord {
  verifiedRecordId: string;
  digitizationId: string;
  sourceExtractionId: string;
  sourceValidationId?: string;
  sourceCrossVerificationId?: string;
  documentType: string;
  verifiedFields: Record<string, VerifiedField>;
  correctionHistory: CorrectionAuditEntry[];
  workflowState: DigitizationWorkflowState;
  verifiedByOfficerId: string;
  officerRole: string;
  jurisdiction: { districtCode?: string; mandalCode?: string; villageCode?: string };
  verificationVersion: number;
  auditReference: string;
  isLocked: boolean;
  finalizedAt?: string;
}
```

---

## 4. Controlled Correction Reason Catalog

| Reason Code | Reason Category | Applicable Scenarios |
| :--- | :--- | :--- |
| `OCR_ERROR` | OCR Character Misread | Printed/Handwritten OCR character misreads (e.g. O vs 0) |
| `HANDWRITING_MISREAD` | Handwriting Scan Misread | GOT-OCR2 cursive or archaic script segmentation issues |
| `TRANSLATION_ERROR` | Translation Shift | Telugu ↔ English IndicTrans2 noun/number translation shifts |
| `EXTRACTION_ERROR` | Entity Boundary Error | Sub-division or extent entity parser boundary errors |
| `DOCUMENT_CONTEXT_ERROR` | Document Context Misread | Contextual misreading of header or footer text |
| `MASTER_DATA_MISMATCH` | Master Data Discrepancy | Administrative boundary spelling mismatch |
| `CROSS_DATABASE_MISMATCH` | Cross-Database Conflict | Discrepancy between scan and LRMS MeeBhoomi database |
| `LEGACY_FORMAT` | Legacy Document Structure | Historical taluk/pargana administrative formats |
| `MISSING_SOURCE_CONTEXT` | Missing Context | Scan page truncation requiring physical verification |
| `MANUAL_VERIFICATION` | Physical Verification | Field measurement book (FMB) ground verification |
| `OTHER` | Other Reason | Requires detailed officer text explanation |

---

## 5. Append-Only Tamper-Evident Audit Ledger
- **Event Hash Chaining**: `eventHash = sha256(previousEventHash + payload)`
- **Event Types**: `DOCUMENT_UPLOADED`, `PROCESSING_STARTED`, `PROCESSING_COMPLETED`, `OCR_COMPLETED`, `EXTRACTION_COMPLETED`, `CONFIDENCE_GENERATED`, `VALIDATION_COMPLETED`, `CROSS_DATABASE_COMPLETED`, `DUPLICATE_DETECTED`, `CONFLICT_DETECTED`, `REVIEW_STARTED`, `FIELD_ACCEPTED`, `FIELD_CORRECTED`, `FIELD_REJECTED`, `OFFICER_SUBMITTED`, `OFFICER_RETURNED`, `ESCALATED`, `APPROVED`, `FINALIZED`, `REOPENED`.

---

## 6. Workflow State Machine

```
DRAFT
  └── PROCESSING
        └── AI_COMPLETE
              └── VALIDATION_COMPLETE
                    └── REVIEW_REQUIRED
                          └── VRO_REVIEW ──► HIGHER_OFFICER_REVIEW ──► APPROVED ──► FINALIZED
                                   ▲                    │                             │
                                   └────── RETURNED ────┴────────── REOPEN_REQUESTED ◄┘
                                                                           │
                                                                           ▼
                                                                        REOPENED
```

---

## 7. Real Operational Analytics
- **Calculated Metrics**: Derived strictly from persisted audit events. Zero synthetic numbers or `Math.random()`.
- **Field Quality Statistics**: Computes `acceptanceRatePct`, `correctionRatePct`, per-field correction frequency (e.g. `surveyNumber` vs `ownerName`), processing duration latencies, and location hierarchy progress (District -> Mandal -> Village).
