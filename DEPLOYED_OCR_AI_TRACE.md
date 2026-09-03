# Deployed OCR & AI Runtime Trace Report

**Project**: e-Bhoomi — Intelligent Land Record Digitization & Validation (SIH26018)  
**Target Document**: `official-copy-of-a-register-specimen.pdf` (Real 1-Page English PDF)  
**Status**: AUDIT COMPLETE (Zero Code Modified)

---

## 1. Did the deployed OCR endpoint receive the actual document?
**NO.**  
The frontend component [`ProcessingPipelineWorkspace.tsx`](file:///r:/e-Bhoomi/src/components/digitization/ProcessingPipelineWorkspace.tsx#L93-L97) called:
```typescript
POST /api/digitization/pipeline/ocr
Body: JSON.stringify({ sourceFile: uploadRecord })
```
`uploadRecord` contains only metadata (`originalFileName`, `storageReference`, `fileSizeBytes`, `pageCount`). It does **not** contain the file's binary stream or base64 payload. Consequently, [`app/api/digitization/pipeline/ocr/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/pipeline/ocr/route.ts#L19-L21) defaulted to:
```typescript
fileBuffer = new ArrayBuffer(0); // 0 bytes allocated
```
Zero actual document bytes reached the OCR engine.

---

## 2. Did OCR return actual English text?
**NO.**  
Because `fileBuffer.byteLength === 0`, [`ocrProvider.ts`](file:///r:/e-Bhoomi/src/lib/digitization/ocrProvider.ts#L25-L35) bypassed execution and returned:
```typescript
{
  extractedText: '',
  overallConfidence: 0,
  pageCount: 1,
  pages: []
}
```

---

## 3. What is the OCR response status?
**`OCR_MODEL_NOT_AVAILABLE`** (or `COMPLETED` with empty string `extractedText: ""` and `overallConfidence: 0`).

---

## 4. Was Groq actually called?
**YES.**  
[`ProcessingPipelineWorkspace.tsx`](file:///r:/e-Bhoomi/src/components/digitization/ProcessingPipelineWorkspace.tsx#L186-L197) (Stage 8) successfully invoked `POST /api/digitization/pipeline/extract`, which executed the server-side Groq Cloud API provider.

---

## 5. Did Groq receive OCR text or an empty payload?
**EMPTY PAYLOAD (`""`).**  
The payload sent to Groq was:
```json
{
  "documentCategory": "ADANGAL",
  "detectedLanguage": "ENGLISH",
  "documentText": ""
}
```

---

## 6. What did Groq return?
Groq strictly followed its zero-hallucination system prompt ("*Extract ONLY facts supported by provided text; return null if missing*") and honestly returned:
```json
{
  "districtName": null,
  "mandalName": null,
  "villageName": null,
  "surveyNumber": null,
  "subDivisionNumber": null,
  "khataNumber": null,
  "ownerName": null,
  "fatherOrHusbandName": null,
  "relationship": null,
  "extentAcres": null,
  "landClassification": null,
  "documentDate": null,
  "registrationNumber": null,
  "mutationReference": null
}
```

---

## 7. Did the frontend receive the extraction response?
**YES.**  
The Next.js API returned `{ success: true, extractedRecord: { ...all null fields... }, status: "SUCCESS" }` back to `ProcessingPipelineWorkspace.tsx`.

---

## 8. Why does the UI show "Not Available" and "0% confidence"?
In [`ProcessingStep.tsx`](file:///r:/e-Bhoomi/src/components/digitization/steps/ProcessingStep.tsx#L31-L35):
- `getFieldVal(null)` converts `null` to `""` (empty string).
- `getConfScore(field)` evaluates to `0` because no OCR words or evidence references existed.
- In [`ExtractionReviewStep.tsx`](file:///r:/e-Bhoomi/src/components/digitization/steps/ExtractionReviewStep.tsx), any field with an empty string value and `confidence: 0` renders as **"Not Available"** with badge **"0% confidence"**.

---

## 9. Exact Files & Functions Responsible

1. **[`src/components/digitization/steps/UploadStep.tsx`](file:///r:/e-Bhoomi/src/components/digitization/steps/UploadStep.tsx#L83-L95)** (`handleUploadSubmit`):
   - Keeps the browser `File` object in local component state (`selectedFile`) but drops the raw buffer/base64 when emitting `onUploadCompleted(rec)`, passing only metadata in `uploadRecord`.
2. **[`src/components/digitization/ProcessingPipelineWorkspace.tsx`](file:///r:/e-Bhoomi/src/components/digitization/ProcessingPipelineWorkspace.tsx#L93-L97)** (`executePipeline`):
   - Sends `{ sourceFile: uploadRecord }` (JSON metadata only) to `/api/digitization/pipeline/ocr` without passing the document's binary data or base64 stream.
3. **[`app/api/digitization/pipeline/ocr/route.ts`](file:///r:/e-Bhoomi/app/api/digitization/pipeline/ocr/route.ts#L19-L21)** (`POST`):
   - Sets `fileBuffer = new ArrayBuffer(0)` when `fileBase64` is missing in request body.

---

## 10. Minimum Code Fix Required

1. **Store/Pass Base64 in Frontend State**:
   In `UploadStep.tsx` or `ProcessingPipelineWorkspace.tsx`, convert `selectedFile` to a base64 string (or ArrayBuffer) and include `fileBase64` in `uploadRecord` / workspace state:
   ```typescript
   // In UploadStep.tsx
   const reader = new FileReader();
   reader.onload = () => {
     const base64 = (reader.result as string).split(',')[1];
     rec.fileBase64 = base64;
     onUploadCompleted(rec);
   };
   reader.readAsDataURL(selectedFile);
   ```

2. **Forward Base64 to OCR API**:
   In `ProcessingPipelineWorkspace.tsx`, pass `fileBase64: uploadRecord.fileBase64` in the `POST /api/digitization/pipeline/ocr` request body:
   ```typescript
   await fetch('/api/digitization/pipeline/ocr', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ sourceFile: uploadRecord, fileBase64: uploadRecord.fileBase64 }),
   });
   ```

3. **Decode & Process in OCR API**:
   In `app/api/digitization/pipeline/ocr/route.ts`, decode `fileBase64` into `ArrayBuffer` and pass it to `ocrProvider.processDocument(fileBuffer, mimeType, fileName)`, which transmits `multipart/form-data` to FastAPI `/document-processing/ocr`.
