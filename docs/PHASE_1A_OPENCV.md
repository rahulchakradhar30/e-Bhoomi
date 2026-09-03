# e-Bhoomi — Phase 1A: Remove Demo Data & Implement OpenCV Document Pre-processing Foundation

## Overview
Phase 1A establishes a clean, server-side document-processing architecture for **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation). It strips away hardcoded demo/fake records from production-facing workflows and integrates OpenCV as the initial real document-intelligence processing engine inside a dedicated server-side Python AI processing service (`ai-service`).

---

## 1. Demo Data Cleanup
All hardcoded sample digitization data, fake owner names ("K. Rama Rao", "Subba Rao"), fake survey numbers ("142/3A"), fake extents ("2.45 Acres"), fake OCR text, and fallback statistics have been removed from production UI components and services:
- **`src/lib/digitization/ocrProvider.ts`**: Removed hardcoded fake text string generation.
- **`src/lib/digitization/aiExtractionProvider.ts`**: Removed hardcoded fake Pattadar and Khata extractions.
- **`src/lib/digitization/visionProvider.ts`**: Removed hardcoded sample table cell values.
- **`src/components/documents/DocumentViewer.tsx`**: Replaced fake document field fallback canvas with a clean preview canvas.
- **`app/officer/dashboard/page.tsx`**: Removed fallback hardcoded survey number (`'142'`) and ensured empty state representation.

*Legitimate administrative master data, Firestore schema definitions, role configurations, and automated test fixtures remain fully intact.*

---

## 2. Server-Side Python AI Service (`ai-service`)
OpenCV is executed strictly server-side within a dedicated Python processing service:

### Conceptual Architecture
```
Next.js Frontend (VRO Workspace)
       ↓
Next.js API Route (/api/digitization/pipeline/preprocess)
       ↓
Python AI Service (http://127.0.0.1:8000/document-processing/preprocess)
       ↓
OpenCV Engine (DocumentPreprocessor)
       ↓
Processed Document + Quality Diagnostics JSON
```

### Directory Structure
```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── preprocess_router.py
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   └── document_preprocessor.py
│   └── schemas/
│       ├── __init__.py
│       └── schemas.py
├── requirements.txt
└── README.md
```

---

## 3. OpenCV Pre-processing Pipeline (`DocumentPreprocessor`)
The `DocumentPreprocessor` module handles non-destructive image and document pre-processing:

1. **File Format & Page Extraction**:
   - Accepts single image files (JPG, JPEG, PNG) and multi-page PDF documents.
   - Extracts PDF pages into individual RGB image frames while preserving page ordering.
2. **Adaptive Image Normalization**:
   - **Contrast Normalization**: Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) when low contrast is detected (`std_dev < 45.0`).
   - **Deskewing & Alignment**: Detects orientation and skew angle using Canny edge transform and Hough Lines (`cv2.HoughLinesP`). Rotates the image safely if `abs(skew_angle) > 0.5°`.
   - **Denoising**: Applies bilateral filtering (`cv2.bilateralFilter`) on high-resolution noisy scans to preserve sharp table gridlines and handwriting strokes.
3. **Document Quality Diagnostics**:
   - **Blur Metric**: Computes Laplacian variance (`cv2.Laplacian`). Flags `blurDetected` if variance is below threshold (`< 80.0`).
   - **Skew Angle**: Computes median line angle in degrees.
   - **Contrast Score**: Calculates standard deviation of grayscale pixel intensities.
   - **Cadastral Map / Diagram Candidate Classification**: Applies morphological horizontal/vertical kernels (`cv2.getStructuringElement`) to assess line density and grid intersection ratio. Classifies pages as `MAP_OR_DIAGRAM` vs `DOCUMENT`.
4. **Fidelity Preservation**:
   - Preserves table boundaries, seals, stamps, and handwritten marginal notes.
   - Avoids aggressive global thresholding that destroys light ink or historical paper texture.

---

## 4. Separation of Original and Processed Documents
- **Original Document**: Kept untouched under `originalReference` (e.g. `secure://ebhoomi-originals/...`).
- **Processed Document**: Created as a separate normalized output under `processedReference` (e.g. `secure://ebhoomi-processed/...`).
- Original scans remain permanently available for future VRO audit and human comparison.

---

## 5. API Reference & Processing States

### Endpoint
`POST /document-processing/preprocess` (Content-Type: `multipart/form-data`)

### Processing Job States
- `UPLOADED`
- `VALIDATING`
- `EXTRACTING_PAGES`
- `PREPROCESSING`
- `COMPLETED`
- `FAILED`
- `RETRY_REQUIRED`

### Diagnostic Response Schema
```json
{
  "processingId": "PROC-A8F12B9C",
  "status": "COMPLETED",
  "pageCount": 1,
  "pages": [
    {
      "pageNumber": 1,
      "originalReference": "secure://ebhoomi-originals/record.pdf#page=1",
      "processedReference": "secure://ebhoomi-processed/record.pdf_p1_proc.jpg",
      "preprocessingStatus": "COMPLETED",
      "transformationsApplied": ["CONTRAST_NORMALIZATION", "DESKEW"],
      "diagnostics": {
        "blurDetected": false,
        "blurScore": 342.15,
        "skewDetected": true,
        "skewAngle": 1.25,
        "rotationDetected": false,
        "rotationAngle": 0,
        "lowContrastDetected": true,
        "contrastScore": 38.4,
        "noiseDetected": false,
        "pageTypeCandidate": "DOCUMENT"
      }
    }
  ],
  "processedAt": "2026-09-03T21:24:00Z"
}
```

---

## 6. Next Integration Point (Phase 1B)
With the OpenCV pre-processing foundation established, Phase 1B will connect downstream OCR engines (Telugu OCR, Tesseract/PaddleOCR for printed text, and handwriting recognition) to consume the normalized `processedReference` output images.
