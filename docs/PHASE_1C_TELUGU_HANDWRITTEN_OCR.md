# e-Bhoomi — Phase 1C: Telugu Handwritten OCR Integration

## Overview
Phase 1C adds **Telugu Handwritten OCR** capabilities to **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation), complementing the Phase 1B printed Telugu OCR foundation. The system uses a computer vision Handwriting Detection & Region Routing layer to segment page images into printed and handwritten regions, routes printed regions to `TeluguOCRProvider` and handwritten regions to `TeluguHandwrittenOCRProvider`, and outputs a unified raw and normalized OCR package ready for downstream language processing.

---

## 1. Handwritten OCR Model & License Metadata
- **Candidate Adapter Model**: [CharanS247/got-ocr2-telugu-handwritten](https://huggingface.co/CharanS247/got-ocr2-telugu-handwritten) (PEFT/LoRA adapter).
- **Base Model**: [stepfun-ai/GOT-OCR-2.0-hf](https://huggingface.co/stepfun-ai/GOT-OCR-2.0-hf).
- **License Terms & Commercial Notice**:
  - `GOT-OCR-2.0` is distributed under an open research / open-weights model license.
  - The adapter `CharanS247/got-ocr2-telugu-handwritten` is an experimental community model.
  - **Disclaimer**: As specified, e-Bhoomi does NOT claim 100% handwriting recognition, legal-grade recognition, or production accuracy until benchmark testing proves it on authorized land records.

---

## 2. Pluggable OCR Architecture Extension
Phase 1C extends the `BaseOCRProvider` architecture established in Phase 1B:

```
                  BaseOCRProvider (Abstract Interface)
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
  TeluguOCRProvider                             TeluguHandwrittenOCRProvider
  (harsha-desaraju/telugu-ocr-model)            (CharanS247/got-ocr2-telugu-handwritten)
```

---

## 3. Handwriting Detection & Region Routing Layer
Pages are visually analyzed by `HandwritingDetector` before OCR execution:

```
Original Document Scan
       ↓
OpenCV Preprocessed Image (Phase 1A)
       ↓
HandwritingDetector (Stroke Variance, Contour Irregularity & Density Analysis)
       ↓
Region Classifier:
  ├── PRINTED_TEXT      ──► TeluguOCRProvider
  ├── HANDWRITTEN_TEXT  ──► TeluguHandwrittenOCRProvider
  ├── TABLE             ──► Preserve Geometry + Printed OCR
  ├── MAP_OR_DIAGRAM    ──► Preserve Map Bounds (Cadastral GIS Phase)
  └── STAMP / SIGNATURE ──► Preserve Metadata Regions
       ↓
OCRRegionRouter (Reading Order Reconstruction: Top-to-Bottom, Left-to-Right)
       ↓
Merged Page OCR JSON (rawOCRText + normalizedOCRText)
```

---

## 4. Cloudinary Integration & Security Architecture
- **Cloudinary Storage Service (`src/lib/storage/cloudinaryService.ts`)**:
  - Handles server-side upload parameter signing (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`).
- **Security Control**:
  - `CLOUDINARY_API_SECRET` remains 100% server-side in `.env.local` / Vercel secrets.
  - Never exposed to browser bundles, React components, or public API responses.
- **Reference Preservation**:
  - A document is uploaded once to generate a stored reference; OpenCV preprocessing, printed OCR, and handwritten OCR all reuse the same stored references without redundant re-uploads.

---

## 5. Truthful State Management & Fallback Policy
- **Model Loading**: Lazy-loads model weights on Python service startup.
- **Resource Constraints / Offline Handling**:
  - If GPU memory is exhausted or weights are uninitialized, returns status:
    `HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE` or `OCR_MODEL_NOT_AVAILABLE` for handwritten regions.
  - Printed text regions continue processing via `TeluguOCRProvider`, resulting in status `OCR_PARTIAL_HANDWRITING_UNAVAILABLE`.
  - **Zero Fake Text**: Never fabricates fake handwritten text or artificial confidence scores.

---

## 6. Region-Level OCR Output Schema
```json
{
  "ocrId": "OCR-MIX-1741123456",
  "status": "COMPLETED",
  "provider": "TeluguOCRProvider + TeluguHandwrittenOCRProvider",
  "language": "te",
  "pageCount": 1,
  "pages": [
    {
      "pageNumber": 1,
      "status": "COMPLETED",
      "handwritingDetected": true,
      "rawText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nరైతు పేరు: రామయ్య",
      "normalizedText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nరైతు పేరు: రామయ్య",
      "regions": [
        {
          "regionIndex": 0,
          "regionType": "PRINTED_TEXT",
          "boundingBox": { "x": 10, "y": 10, "width": 600, "height": 40 },
          "provider": "TeluguOCRProvider",
          "rawText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు",
          "normalizedText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు",
          "status": "COMPLETED"
        },
        {
          "regionIndex": 1,
          "regionType": "HANDWRITTEN_TEXT",
          "boundingBox": { "x": 10, "y": 60, "width": 600, "height": 50 },
          "provider": "TeluguHandwrittenOCRProvider",
          "rawText": "రైతు పేరు: రామయ్య",
          "normalizedText": "రైతు పేరు: రామయ్య",
          "status": "COMPLETED"
        }
      ]
    }
  ],
  "rawOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nరైతు పేరు: రామయ్య",
  "normalizedOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nరైతు పేరు: రామయ్య",
  "overallStatus": "READY_FOR_LANGUAGE_PROCESSING",
  "processedAt": "2026-09-03T21:55:00Z",
  "processingTimeMs": 1240
}
```

---

## 7. Known Model Limitations
1. **Compound Characters & Conjunct Consonants**: The model card reports reduced accuracy on complex Telugu ottulu (ఒత్తులు) and conjunct combinations.
2. **Vowel Modifiers**: Faded handwritten matras (మాత్రలు) may require manual VRO verification.
3. **Line Overlaps & Faded Ink**: Historical survey register pages with severe ink bleed require OpenCV CLAHE contrast enhancement before OCR.

---

## 8. Benchmark Harness (`scripts/benchmark_ocr.py`)
Run developer benchmarks comparing printed vs handwritten OCR accuracy and speed:
```bash
python scripts/benchmark_ocr.py --file test-docs/handwritten_sample.jpg --mode mixed
```
Measures CER (Levenshtein distance), region classification count, and execution duration.

---

## 9. Next Integration Point (Phase 1D / Language Processing)
At the conclusion of Phase 1C, the normalized document package carries status `READY_FOR_LANGUAGE_PROCESSING`. Downstream language processing (Telugu NLP normalization and Telugu → English translation) will consume this unified OCR package in the next phase.
