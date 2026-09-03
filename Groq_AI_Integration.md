# Groq Cloud AI Provider Integration Documentation
e-Bhoomi — Intelligent Land Record Digitization & Validation (SIH26018)

## 1. Role in e-Bhoomi
Groq Cloud AI serves as the server-side high-speed LLM extraction engine for e-Bhoomi. It processes document text produced by OpenCV pre-processing, Telugu/English OCR, Indic NLP, and IndicTrans2 translation, extracting structured land record entities while strictly adhering to e-Bhoomi land record schemas.

---

## 2. Server-Side Architecture & Security
```
Next.js Server API (POST /api/digitization/pipeline/extract)
   │
   ├── Python FastAPI Endpoint (POST /document-processing/extract-groq)
   │
   ▼
GroqAIProvider (src/lib/digitization/ai/groqAiProvider.ts / PythonGroqProvider)
   │  • Authorization: Bearer GROQ_API_KEY (Server-side environment variable)
   │  • Model: GROQ_MODEL (openai/gpt-oss-120b)
   │  • Base URL: GROQ_API_BASE_URL (https://api.groq.com/openai/v1)
   │
   ▼
Groq Cloud API (https://api.groq.com/openai/v1/chat/completions)
```

> **Security Guarantee**: `GROQ_API_KEY` is loaded strictly on the server from `.env.local` (protected by `.gitignore`). Zero API keys or authorization headers are exposed to browser JavaScript, React components, client-side bundles, or GitHub repositories.

---

## 3. Environment Configuration (`.env.local`)
```env
# Server-Side Groq Cloud AI Configuration (NEVER expose to client JS / NEXT_PUBLIC_*)
GROQ_API_KEY=gsk_************************************************
GROQ_MODEL=openai/gpt-oss-120b
GROQ_API_BASE_URL=https://api.groq.com/openai/v1
AI_PROVIDER=groq
```

---

## 4. Prompt Engineering & Schema Constraints
Extraction system prompt (`groq-land-extraction-v1`):
- **Grounding Rule**: Extract ONLY facts supported by provided OCR/NLP text.
- **Zero Hallucination Rule**: Return `null` for any unmentioned field. Never invent missing names, survey numbers, khata numbers, or extent values.
- **Schema Mapping**:
  - `districtName`, `mandalName`, `villageName`
  - `surveyNumber`, `subDivisionNumber`, `khataNumber`
  - `ownerName`, `fatherOrHusbandName`, `relationship`
  - `extentAcres`, `landClassification`, `documentDate`, `registrationNumber`, `mutationReference`

---

## 5. Confidence, Validation & Downstream Compatibility
- **Phase 3 Confidence Integration**: Groq extraction output flows directly into `ConfidenceEngine`. Groq self-reported probability is ignored; confidence is derived deterministically from page evidence references.
- **Phase 4 Validation Integration**: Extracted records are validated by `ValidationEngine` against master data hierarchies and extent bounds.
- **Phase 5 Verification Integration**: Checked for duplicates (`DuplicateDetectionEngine`) and cross-database conflicts.
- **Phase 6 Human Verification**: VRO officers review field extractions, log controlled correction reasons, and generate append-only tamper-evident audit logs (`AuditLedgerEngine`). `aiExtractedRecord` remains 100% immutable.

---

## 6. Honest Failure Handling & Zero Fake Data Policy
When `GROQ_API_KEY` is missing or API requests fail:
- Returns `status: "AI_PROVIDER_UNAVAILABLE"` or `status: "AI_EXTRACTION_FAILED"`.
- **Zero Synthetic Fallback**: No static fake land records (e.g. K. Rama Rao, 142/3A) are injected.

---

## 7. Versioning & Observability
Audit metadata includes:
- `provider`: `"GROQ"`
- `model`: `"openai/gpt-oss-120b"`
- `promptVersion`: `"groq-land-extraction-v1"`
- `usage`: Token count observability metadata.
