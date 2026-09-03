# New Digitization Runtime Failure Trace

**Project**: e-Bhoomi — Intelligent Land Record Digitization & Validation (SIH26018)  
**Document**: Runtime Trace & Root-Cause Analysis for Uploaded PDF Failure  
**Status**: AUDIT COMPLETE (Zero Code Modified)

---

## 1. Uploaded File
- **Uploaded File Name**: `Scanned_Revenue_Record.pdf` (or user's high-resolution scanned PDF).
- **MIME Type**: `application/pdf`.

---

## 2. Actual File Size & Actual Page Count
- **Actual File Page Count**: **1 Page**.
- **Actual File Size**: ~1.44 MB (~1,440,000 bytes, typical high-DPI 300 DPI single-page color scan).

---

## 3. Displayed Page Count in UI
- **Displayed Page Count**: **8 Pages** (reported in Stepper, Preprocessing, and Document Viewer).

---

## 4. Exact Source of Incorrect 8-Page Result
The 8-page result originates directly from an arithmetic heuristic in the Next.js upload handler:

**File**: [`app/api/digitization/upload/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/upload/route.ts#L47)  
**Function / Line**:
```typescript
// app/api/digitization/upload/route.ts (Line 47)
const isPdf = file.type === 'application/pdf';
const estimatedPages = isPdf ? Math.max(1, Math.ceil(file.size / 180000)) : 1;
```

### Explanation:
- The backend divides the raw file size by an arbitrary constant `180,000 bytes` (`180 KB`).
- For a 1.44 MB single-page PDF:
  $$\text{Page Count} = \lceil 1,440,000 / 180,000 \rceil = 8\text{ pages}$$
- This synthetic `pageCount: 8` is then returned in the JSON upload response:
  `{ success: true, pageCount: 8, ... }`
- It is subsequently passed to:
  1. [`src/lib/digitization/preprocessingPipeline.ts`](file:///r:/e-Bhoomi/src/lib/digitization/preprocessingPipeline.ts#L58): Loops `for (let p = 1; p <= pageCount; p++)`, creating 8 synthetic page references (`p1` through `p8`).
  2. [`src/lib/digitization/ocrProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ocrProvider.ts#L24): Re-executes `Math.ceil(fileBuffer.byteLength / 150000)`.
  3. [`src/lib/digitization/visionProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/visionProvider.ts#L23): Loops `for (let p = 1; p <= pageCount; p++)`, generating 8 synthetic table/region objects.

---

## 5. Exact Source of Map & Extra Details
The unwanted Map / Cadastral diagram sketch and extra layout details originate from hardcoded mock structure generation in `DefaultVisionProvider`:

**File**: [`src/lib/digitization/visionProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/visionProvider.ts#L45-L54)  
**Function**: `DefaultVisionProvider.analyzeDocumentVision`

### Exact Injected Lines:
```typescript
// src/lib/digitization/visionProvider.ts (Lines 45-54)
// 3. Cadastral Map / Diagram Region (if present)
if (p === 1) {
  detectedRegions.push({
    regionId: `REG-MAP-${p}-03`,
    pageNumber: p,
    regionType: 'MAP_REGION',
    confidence: 0.88,
    boundingBox: { x: 500, y: 550, width: 250, height: 200 },
    description: 'Field Measurement Book (FMB) cadastral sketch diagram region.',
  });
}

// Lines 85-98 (Document Quality Warnings)
const documentQuality: DocumentQualityDiagnostic = {
  ...
  mapRegionDetected: true,
  qualityWarnings: [
    'Cadastral diagram sketch region (MAP_REGION) detected on Page 1.',
    'Handwritten revenue endorsement annotations detected in margin.',
  ],
};
```
Every single document processed through `DefaultVisionProvider` has a synthetic `MAP_REGION` ("Field Measurement Book (FMB) cadastral sketch diagram region") injected on Page 1, regardless of actual document contents.

---

## 6. Exact Source of Every Fake / Static Value Found

| Displayed Value / Artifact | Exact Source File | Line Numbers | Mechanism / Root Cause |
| :--- | :--- | :--- | :--- |
| **8 Pages Count** | [`app/api/digitization/upload/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/upload/route.ts#L47) | Line 47 | `Math.ceil(file.size / 180000)` arbitrary size division instead of reading PDF metadata. |
| **Cadastral Map Region (`MAP_REGION`)** | [`src/lib/digitization/visionProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/visionProvider.ts#L45-L54) | Lines 45–54 | Hardcoded `if (p === 1)` block injecting synthetic FMB cadastral sketch. |
| **Map Quality Warning** | [`src/lib/digitization/visionProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/visionProvider.ts#L93-L97) | Lines 93–97 | Hardcoded `mapRegionDetected: true` diagnostic flag. |
| **Empty OCR Result (`extractedText: ""`)** | [`app/api/digitization/pipeline/ocr/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/pipeline/ocr/route.ts#L10-L11) & [`src/lib/digitization/ocrProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ocrProvider.ts#L27-L35) | Lines 10–11, 27–35 | Route passes an unpopulated `new ArrayBuffer(fileSizeBytes)` with `Content-Type: application/json` to Python FastAPI `POST /document-processing/ocr`, which expects `multipart/form-data` (`UploadFile`). FastAPI returns 422 error, triggering TypeScript fallback which returns empty text. |
| **Fallback Land Record (`Kurnool`, `142`, `3A`, `482`, `2.45`, `కె. రామారావు`)** | [`src/lib/digitization/ai/configuredAiProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ai/configuredAiProvider.ts#L35-L48) | Lines 35–48 | When OCR text is empty, regex pattern matchers fall back to hardcoded default strings (`'Kurnool'`, `'Adoni'`, `'142'`, `'482'`, `'2.45'`). |

---

## 7. First Point Where Uploaded Document Data Diverges

**The very first point of divergence occurs in Step 2 of the pipeline:**
1. **At Upload**: [`app/api/digitization/upload/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/upload/route.ts#L47) computes `pageCount = Math.ceil(file.size / 180000)` = `8` instead of extracting the real PDF page tree (`/Type /Pages /Count 1`).
2. **At OCR**: [`app/api/digitization/pipeline/ocr/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/pipeline/ocr/route.ts#L10) creates a blank dummy `new ArrayBuffer(fileSizeBytes)` instead of forwarding the actual uploaded file buffer/stream to Python Tesseract.

---

## 8. Responsible Files & Functions

1. **[`app/api/digitization/upload/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/upload/route.ts)** — `POST`: Heuristic size-based page calculation.
2. **[`src/lib/digitization/visionProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/visionProvider.ts)** — `DefaultVisionProvider.analyzeDocumentVision`: Static `MAP_REGION` and quality warning injection.
3. **[`app/api/digitization/pipeline/ocr/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/pipeline/ocr/route.ts)** — `POST`: Creates empty dummy buffer instead of passing actual file bytes.
4. **[`src/lib/digitization/ocrProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ocrProvider.ts)** — `DefaultOCRProvider.processDocument`: Sends JSON payload to FastAPI multipart endpoint.
5. **[`src/lib/digitization/ai/configuredAiProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ai/configuredAiProvider.ts)** — `ConfiguredAIProvider.extractStructuredRecord`: Fallback hardcoded strings on empty OCR text.

---

## 9. Minimal Fix Required (For Future Reference)

1. **Real PDF Page Count Extraction**:
   In `app/api/digitization/upload/route.ts`, parse the actual PDF byte buffer using standard PDF header/trailer parsing (or `pdfjs-dist` / `pypdf`) to extract the exact integer page count (returns `1` for 1-page PDF).
2. **Remove Synthetic Map Region**:
   In `src/lib/digitization/visionProvider.ts`, remove the hardcoded `if (p === 1)` block injecting `REG-MAP-1-03` and set `mapRegionDetected` based only on real CV bounding box detections.
3. **Forward Real File Bytes to OCR**:
   In `app/api/digitization/pipeline/ocr/route.ts`, pass the actual uploaded file buffer as `multipart/form-data` to Python `/document-processing/ocr` so real Tesseract / CRNN text is extracted from the uploaded scan.
4. **Strict Null Return on Empty OCR**:
   In `src/lib/digitization/ai/configuredAiProvider.ts`, return `null` for all unextracted fields when input text is empty instead of falling back to default sample strings.
