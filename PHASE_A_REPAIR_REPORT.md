# Phase A Repair Report: Real Document Data Lineage

**Project**: e-Bhoomi — Intelligent Land Record Digitization & Validation (SIH26018)  
**Date**: September 2026  
**Scope**: Elimination of synthetic page count heuristics, synthetic map regions, dummy OCR buffers, and hardcoded fallback strings.

---

## 1. Root Causes Fixed

1. **Size-Based Page Count Heuristic**:
   - `app/api/digitization/upload/route.ts` previously used `Math.ceil(file.size / 180000)` which erroneously reported 8 pages for a 1.44 MB single-page PDF.
   - **Fix**: Implemented genuine binary PDF page tree parsing (`/Count \d+` and `/Type /Page`) from the uploaded buffer.
2. **Synthetic Cadastral Map Region**:
   - `src/lib/digitization/visionProvider.ts` unconditionally injected `REG-MAP-1-03` ("Field Measurement Book (FMB) cadastral sketch diagram") on Page 1.
   - **Fix**: Removed hardcoded map region injection and set `mapRegionDetected: false`.
3. **Dummy OCR Buffer & Multipart Mismatch**:
   - `app/api/digitization/pipeline/ocr/route.ts` allocated `new ArrayBuffer(fileSizeBytes)` and sent JSON to a FastAPI endpoint expecting `multipart/form-data`.
   - **Fix**: Updated `ocrProvider.ts` to send genuine binary content via `FormData` (`multipart/form-data`) to `/document-processing/ocr`.
4. **Hardcoded Fallback Land Record Strings**:
   - `src/lib/digitization/ai/configuredAiProvider.ts` injected sample strings (`'Kurnool'`, `'Adoni'`, `'142'`, `'482'`, `'2.45'`, `'కె. రామారావు'`) when OCR text was empty.
   - **Fix**: Completely deleted all fallback default values; returns `null` for missing fields and `AI_PROVIDER_UNAVAILABLE` when OCR text is empty.

---

## 2. Files Changed

| File Path | Nature of Change |
| :--- | :--- |
| [`app/api/digitization/upload/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/upload/route.ts) | Implemented binary PDF page extraction; removed `Math.ceil(file.size / 180000)`. |
| [`src/lib/digitization/visionProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/visionProvider.ts) | Removed synthetic `REG-MAP-1-03` injection and cleared fake map quality warnings. |
| [`src/lib/digitization/ocrProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ocrProvider.ts) | Updated `processDocument` to transmit binary document via `multipart/form-data`. |
| [`app/api/digitization/pipeline/ocr/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/pipeline/ocr/route.ts) | Forwards real file buffer/base64 to `ocrProvider`; removed dummy buffer allocation. |
| [`src/lib/digitization/ai/configuredAiProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ai/configuredAiProvider.ts) | Deleted all hardcoded default fallback values (`Kurnool`, `142`, `482`, `2.45`, etc.). |
| [`scripts/benchmark_phase_a.py`](file:///r:/e-Bhoomi/scripts/benchmark_phase_a.py) | Created 10-scenario Phase A data lineage verification benchmark. |

---

## 3. Before vs After Runtime Behavior

| Aspect | Before Phase A Fix | After Phase A Fix |
| :--- | :--- | :--- |
| **1-Page PDF Upload** | Displayed **8 Pages** (calculated via `1.44MB / 180KB`) | Displays **1 Page** (exact binary page count extracted) |
| **2-Page PDF Upload** | Displayed **16 Pages** (calculated via `2.88MB / 180KB`) | Displays **2 Pages** (exact binary page count extracted) |
| **Cadastral Map Region** | Unconditionally injected `REG-MAP-1-03` on Page 1 | Zero fake map regions created (`mapRegionDetected: false`) |
| **OCR Transmission** | Empty dummy `ArrayBuffer` sent via JSON | Real binary stream sent via `multipart/form-data` |
| **Empty OCR Input** | Fabricated fallback record (`Kurnool`, `142/3A`, `482`) | Honestly returns `AI_PROVIDER_UNAVAILABLE` with `null` fields |

---

## 4. Runtime Benchmark & Verification Results

Executed `python scripts/benchmark_phase_a.py` with 10 scenarios:

| Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- |
| **TEST 1: Real 1-Page PDF Page Count** | `1` | `1` | ✅ PASSED |
| **TEST 2: Real 2-Page PDF Page Count** | `2` | `2` | ✅ PASSED |
| **TEST 3: Corrupt PDF Header Rejection** | `-1` | `-1` | ✅ PASSED |
| **TEST 4: Elimination of Size-Based Page Heuristic** | `False` | `False` | ✅ PASSED |
| **TEST 5: Elimination of Synthetic Map Region** | `False` | `False` | ✅ PASSED |
| **TEST 6: Elimination of Fallback Land Strings** | `False` | `False` | ✅ PASSED |
| **TEST 7: Elimination of Dummy Buffer in OCR Route** | `False` | `False` | ✅ PASSED |
| **TEST 8: Real English Document Groq Extraction** | `SUCCESS` | `SUCCESS` | ✅ PASSED |
| **TEST 9: Real Telugu Document Groq Extraction** | `SUCCESS` | `SUCCESS` | ✅ PASSED |
| **TEST 10: Empty Input Returns 100% Null (Zero Hallucination)** | `True` | `True` | ✅ PASSED |

---

## 5. Fake Data Search Audit
Searched entire repository for:
- `Math.ceil(file.size`: **0 occurrences in live workflow code** (Replaced with binary PDF parser).
- `180000`: **0 occurrences in live workflow code**.
- `REG-MAP`: **0 occurrences in live workflow code**.
- `FMB cadastral sketch`: **0 occurrences in live workflow code**.
- `new ArrayBuffer(sourceFile`: **0 occurrences in live workflow code**.
- `|| 'Kurnool'`: **0 occurrences in live workflow code**.
- `|| '142'`: **0 occurrences in live workflow code**.
- `|| '482'`: **0 occurrences in live workflow code**.

---

## 6. Build Validation Results

- **Python Syntax Compilation (`py_compile`)**: **Passed with 0 errors**.
- **TypeScript Type Check (`npx tsc --noEmit`)**: **Passed with 0 errors**.
- **Next.js Production Build (`npm run build`)**: **Passed with 0 errors (93/93 static & dynamic routes compiled)**.

---

## 7. Remaining Issues
- **None**: All document data lineage defects identified in `DIGITIZATION_FAILURE_TRACE.md` are resolved.

---

## 8. Final Status Declaration

```
PHASE_A_COMPLETE
```
