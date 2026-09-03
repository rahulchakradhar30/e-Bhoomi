# eBhoomi UI Refinement, Security Hardening, Master Data, Session Management & Confidential Forgot Password

This document details the visual, responsive, security hardening, master data consolidation, session management, and confidential authentication features implemented across the eBhoomi portal.

## Summary of Confidential Forgot Password Feature

### Implementation Overview
Added a privacy-hardened **Forgot Password** workflow exclusively to:
- **Officer Login** (`/login` via `OfficerLogin.tsx`)
- **System Admin Login** (`/admin/login` via `AdminLogin.tsx`)

### Privacy & Security Principles
1. **Zero Information Leakage**: Neither registered email addresses, phone numbers, nor account identity details are ever displayed on screen or returned in responses.
2. **Server-Side Identity Resolution**: For Officer IDs (e.g. `AP-511-VRO-123456`), identity resolution is performed server-side via `/api/auth/resolve-login-id` without exposing the resolved email address to the browser client.
3. **Confidential Messaging**: Regardless of whether the ID exists or an email is sent, the UI presents the exact confidential confirmation message requested:
   `"Your reset password link is sent."`

---

## Summary of Officer Login Identity Resolution Fix

### Problem Resolved
In the Officer Login (`/login`), valid officer credentials were throwing `"Invalid ID or password."` due to strict single-case exact string matches on `loginId` in the server-side ID resolution API (`/api/auth/resolve-login-id`).

### Fix Implemented
1. **Multi-Field & Case-Insensitive Officer Resolution (`app/api/auth/resolve-login-id/route.ts`)**:
   - Queries `officers` collection across multiple case variations (`uppercase`, `lowercase`, `trimmed`) and field names (`loginId`, `officerId`, `officialEmail`, `email`).
   - Added fallback query to `users` collection.
   - Robust email resolution checking `officialEmail || email || userEmail`.

---

## Summary of Session Security & Password Lifecycle Management

### 1. Global 5-Minute Inactivity Timeout (`SessionTimeoutProvider.tsx`)
- **Universal Policy**: Applies to all authenticated officer roles (`SYSTEM_ADMIN`, `STATE_OFFICER`, `COLLECTOR`, `RDO`, `MRO`, `VRO`).
- **Real Activity Tracking**: Monitors actual DOM user interactions (`mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll`, `click`).
- **30-Second Warning Banner**: Non-disruptive banner appears at 4 minutes 30 seconds (`270s`) with a 30-second countdown and a "Continue Session" action.

### 2. Verified Password Change System (`PasswordChangeForm.tsx`)
- **System Admin 2FA Integration**: Dispatches a 6-digit 2FA OTP (`POST /api/auth/admin-otp`) to the admin's email and requires OTP verification before applying password updates.

---

## Summary of Master Data Consolidation & Search Improvement

### 1. Navigation Clean-Up & Consolidation
- **Single Central Browser**: `Master Data` (`/admin/master-data`) is the single authoritative administrative geometry browser for the entire platform.

### 2. Integrated Search Engine Across All 5 Hierarchy Levels
Added real-time search inputs to each hierarchy column in [`MasterDataBrowser.tsx`](file:///r:/e-Bhoomi/src/components/tables/MasterDataBrowser.tsx) for Districts, Revenue Divisions, Mandals, Villages, and Secretariats.

---

## Files Modified & Created

1. **`src/components/forms/OfficerLogin.tsx`**
   - Added confidential Forgot Password flow.
2. **`src/components/forms/AdminLogin.tsx`**
   - Added confidential Forgot Password flow.
3. **`src/lib/services/authService.ts`**
   - Added `requestPasswordReset(email)` function with silent exception handling.
4. **`app/api/auth/resolve-login-id/route.ts`**
   - Multi-field, case-insensitive, fallback officer identity resolution.

---

## Summary of Phase 1A: Remove Demo Data & Implement OpenCV Document Pre-processing Foundation

### 1. Production Demo Data Cleanup
- Removed hardcoded fake owner names ("K. Rama Rao", "Subba Rao"), survey numbers ("142/3A"), extents ("2.45 Acres"), fake OCR outputs, and fake AI extraction results across `ocrProvider.ts`, `aiExtractionProvider.ts`, `visionProvider.ts`, `DocumentViewer.tsx`, `OfficerDashboardPage`, and `ExtractionReviewStep.tsx`.
- Ensured VRO New Digitization workspace begins with clean empty states ("No digitization records yet.").
- Retained administrative master data, schemas, role configurations, and test fixtures.

### 2. Dedicated Server-Side Python AI Service (`ai-service/`)
- Created Python FastAPI service in `ai-service/` containing `DocumentPreprocessor`:
  - Input validation & multi-page PDF image rendering via `pypdf` / `Pillow`.
  - Server-side OpenCV processing (CLAHE contrast normalization, Hough line deskewing, bilateral denoising).
  - Document Quality Diagnostics (Laplacian blur calculation, skew angle calculation, contrast score).
  - Cadastral Map / Diagram candidate classification (`MAP_OR_DIAGRAM`).
  - Separation of untouched original scans from preprocessed images.

### 3. Next.js API Bridge & UI Stage Updates
- Connected `/api/digitization/pipeline/preprocess` route handler to communicate with the Python service.
- Updated `ProcessingPipelineWorkspace.tsx` stages:
  - `✓ Document received & initialized`
  - `✓ Pages extracted & order preserved`
  - `● Server-Side OpenCV Pre-processing (Deskew, Denoise, Contrast & Quality Diagnostics)`
  - `○ Multi-Lingual OCR (Pending Next Phase)`
  - `○ AI Structure Extraction (Pending Next Phase)`

### 4. Technical Documentation
- Created technical documentation [`docs/PHASE_1A_OPENCV.md`](file:///r:/e-Bhoomi/docs/PHASE_1A_OPENCV.md).

---

## Summary of Phase 1B: Real Telugu OCR Integration

### 1. Pluggable OCR Provider Architecture (`BaseOCRProvider`)
- Implemented `BaseOCRProvider` abstract class and `TeluguOCRProvider` targeting `harsha-desaraju/telugu-ocr-model`.
- Architecture prevents hardcoding TeluguOCR into downstream flows; future engines (English OCR, Tesseract) plug into the same interface.

### 2. Line Segmentation & Text Normalization
- Added `LineSegmenter` using OpenCV morphological line extraction to feed text-line crops to the line-level TrOCR model while preserving reading order.
- Created `TeluguNormalizer` for Unicode NFKC, whitespace, and line-ending normalization.
- Preserved both `rawOCRText` and `normalizedOCRText` for evaluation and audit.

### 3. Hardware Auto-Detection & Truthful State Management
- Auto-detects GPU (`cuda`) vs CPU execution.
- Truthful state: If model weights are missing/unloaded, returns status `OCR_MODEL_NOT_AVAILABLE` with setup guidance (no fake text generated!).

### 4. Developer Benchmark Harness & Documentation
- Created developer benchmark script [`scripts/benchmark_ocr.py`](file:///r:/e-Bhoomi/scripts/benchmark_ocr.py) for evaluating OCR performance and Character Error Rate (CER).
- Created technical documentation [`docs/PHASE_1B_TELUGU_OCR.md`](file:///r:/e-Bhoomi/docs/PHASE_1B_TELUGU_OCR.md).

---

## Summary of Phase 1C: Telugu Handwritten OCR Integration

### 1. TeluguHandwrittenOCRProvider (`CharanS247/got-ocr2-telugu-handwritten`)
- Implemented `TeluguHandwrittenOCRProvider` extending `BaseOCRProvider` targeting candidate adapter `CharanS247/got-ocr2-telugu-handwritten` (base `stepfun-ai/GOT-OCR-2.0-hf`).
- Server-side lazy loading, caching, and CPU/GPU auto-detection (`torch.cuda.is_available()`).
- Preserved existing printed `TeluguOCRProvider` (Phase 1B) 100% operational.

### 2. Computer Vision Handwriting Detector & Region Router
- Created `HandwritingDetector` (`ai-service/app/ocr/handwriting_detector.py`) analyzing stroke variance and contour irregularity to classify regions into `PRINTED_TEXT`, `HANDWRITTEN_TEXT`, `MIXED_TEXT`, `TABLE`, `MAP_OR_DIAGRAM`, `STAMP`, `SIGNATURE`, `UNKNOWN_REGION`.
- Created `OCRRegionRouter` (`ai-service/app/ocr/region_router.py`) routing `PRINTED_TEXT` → `TeluguOCRProvider` and `HANDWRITTEN_TEXT` → `TeluguHandwrittenOCRProvider`. Reconstructs reading order preserving region bounding boxes and normalized text.

### 3. Cloudinary Integration & Security Controls
- Implemented `CloudinaryStorageService` (`src/lib/storage/cloudinaryService.ts`) for signed server-side uploads.
- `CLOUDINARY_API_SECRET` remains strictly server-side (never exposed to browser bundles).
- Document references are stored once and reused across OpenCV preprocessing, printed OCR, and handwritten OCR without redundant re-uploads.

### 4. Benchmark Script & Technical Documentation
- Updated [`scripts/benchmark_ocr.py`](file:///r:/e-Bhoomi/scripts/benchmark_ocr.py) supporting mixed-mode CER/WER evaluation.
- Created technical documentation [`docs/PHASE_1C_TELUGU_HANDWRITTEN_OCR.md`](file:///r:/e-Bhoomi/docs/PHASE_1C_TELUGU_HANDWRITTEN_OCR.md).

---

## Summary of Phase 1D: Indic NLP Integration

### 1. IndicNLPService (`indic-nlp-library`)
- Integrated official `indic-nlp-library` (v0.2.0+) for Unicode normalization, tokenization, and sentence segmentation (`ai-service/app/nlp/indic_nlp_service.py`).
- Supports mixed-language detection (`te`, `en`, `te+en`).

### 2. Strict Number & Name Preservation
- Survey numbers (`142/3A`), extents (`2.45`), khata numbers (`482`), dates (`15.06.2004`), and personal owner names are preserved **EXACTLY** as extracted by OCR.

### 3. Terminology & Custom Glossary Architecture
- Established `LandRecordGlossary` (`ai-service/app/nlp/glossary.py`) mapping Telugu land record terms (`Adangal`, `RoR-1B`, `Pattadar`, `Khata`, `Survey`, `Extent`, `Mandal`, `District`, `Mutation`, `Partition`, `Succession`).
- Created technical documentation [`docs/PHASE_1D_INDIC_NLP.md`](file:///r:/e-Bhoomi/docs/PHASE_1D_INDIC_NLP.md) and developer benchmark [`scripts/benchmark_nlp.py`](file:///r:/e-Bhoomi/scripts/benchmark_nlp.py).

---

## Summary of Phase 1E: Telugu ↔ English Language Processing Using IndicTrans2

### 1. IndicTrans2Provider (`AI4Bharat/IndicTrans2`)
- Implemented `IndicTrans2Provider` extending `BaseTranslationProvider` targeting candidate model `ai4bharat/indictrans2-indic-en-1B` (language pair: `tel_Tel` -> `eng_Latn`) with architectural readiness for `eng_Latn` -> `tel_Tel`.
- Server-side lazy loading, caching, and CPU/GPU auto-detection (`torch.cuda.is_available()`).

### 2. Traceable Four-Layer Output Architecture
- Maintains 4 non-destructive text layers: `rawOCRText`, `normalizedOCRText`, `nlpProcessedText`, and `translatedText`.
- Dual-language evidence chain (Telugu Source + English Translation) is preserved to feed **Phase 2 AI Structured Extraction**.
- Created technical documentation [`docs/PHASE_1E_INDIC_TRANS2.md`](file:///r:/e-Bhoomi/docs/PHASE_1E_INDIC_TRANS2.md) and developer benchmark [`scripts/benchmark_translation.py`](file:///r:/e-Bhoomi/scripts/benchmark_translation.py).

---

## Summary of Phase 2: AI/NLP Structured Land Record Extraction

### 1. AIExtractionProvider & DocumentSchemaRegistry
- Implemented `AIExtractionProvider` (`ai-service/app/extraction/ai_extraction_provider.py`) extending `BaseAIExtractionProvider`.
- Integrated `DocumentSchemaRegistry` managing document schemas across 6 official categories (`ADANGAL`, `ROR_1B`, `MUTATION`, `PARTITION_SUCCESSION`, `PATTADAR_PASSBOOK_TITLE_DEED`, `LEGACY_REVENUE_RECORD`) and `UNKNOWN_OTHER`.
- Extracts Common Land Fields, Boundaries, Parties & Relationships (`[{ name, relationship, role, share, extent }]`), and Unmapped Fields while preserving numbers (`142/3A`, `2.45`, `15.06.2004`) and owner names (`కె. రామారావు`) **EXACTLY**.
- Created technical documentation [`docs/PHASE_2_AI_NLP_EXTRACTION.md`](file:///r:/e-Bhoomi/docs/PHASE_2_AI_NLP_EXTRACTION.md) and developer benchmark [`scripts/benchmark_extraction.py`](file:///r:/e-Bhoomi/scripts/benchmark_extraction.py).

---

## Summary of Phase 3: Field-Level Confidence Scoring + Source Evidence + Traceability

### 1. ConfidenceEngine (`ai-service/app/confidence/confidence_engine.py`)
- Calculates normalized field-level confidence scores (`0.0`–`1.0`) with explicit score sources (`MODEL_PROVIDED`, `RULE_DERIVED`, `EVIDENCE_DERIVED`, `HEURISTIC`, `UNAVAILABLE`).
- Binds extracted fields to original source text, page numbers, and bounding-box coordinates (`evidence`).
- Multi-candidate conflict detection: Preserves candidate arrays across pages and assigns status `CONFLICT`.
- Weighted Document Review Priority: Aggregates critical field statuses (`ownerName`, `surveyNumber`, `extent`, `district`, `mandal`, `village`) into overall review priorities (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Created technical documentation [`docs/PHASE_3_CONFIDENCE_AND_EVIDENCE.md`](file:///r:/e-Bhoomi/docs/PHASE_3_CONFIDENCE_AND_EVIDENCE.md) and developer benchmark [`scripts/benchmark_confidence.py`](file:///r:/e-Bhoomi/scripts/benchmark_confidence.py).

---

## Verification Performed

- Verified clean production build with `npm run build`.
- Verified Python service modules and API routers.
- Confirmed zero hardcoded fake digitization records appear in VRO digitization workspace.

