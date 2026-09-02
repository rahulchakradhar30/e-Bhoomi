# e-BHOOMI PHASE 1 — DOCUMENT INTELLIGENCE FOUNDATION MANUAL

## 1. Executive Summary
Phase 1 implements the core Document Intelligence Foundation for e-Bhoomi (SIH26018 — Intelligent Land Record Digitization & Validation). It establishes a modular, asynchronous processing pipeline (`DocumentProcessingJob`) that converts physical land record scans into a normalized intermediate document representation (`NormalizedDocumentRepresentation`).

---

## 2. Five Core Components

### 1. Automated Document Classification
- **Provider Abstraction**: `ClassificationProvider` (`src/lib/digitization/classificationProvider.ts`).
- **Multi-Signal Analysis**: Analyzes text keywords, heading patterns, layout structure, Khata tables, and VRO context priors.
- **Supported Categories**:
  - `ADANGAL` (అడంగల్)
  - `ROR_1B` (ఆర్.ఓ.ఆర్ – 1-బి)
  - `MUTATION` (మ్యూటేషన్)
  - `PARTITION` (విభజన)
  - `PASSBOOK` (పాస్బుక్ / టైటిల్ డీడ్)
  - `LEGACY_REVENUE` (పాత రెవెన్యూ రికార్డు)
  - `UNKNOWN_OTHER` (Uncertain/ambiguous category)
- **Mismatch Detection**: Detects mismatches between VRO selected category and AI detected category non-destructively, surfacing an alert banner while preserving VRO selection.

### 2. Advanced Multilingual OCR
- **Provider Abstraction**: `OCRProvider` (`src/lib/digitization/ocrProvider.ts`).
- **Language Support**: Telugu (`te`), English (`en`), and Mixed Multilingual content.
- **Output Structure**: `NormalizedOCRResult` capturing page-level full text, confidence scores, blocks (`PRINTED_TEXT`, `NUMERIC_SCHEDULE`, `HANDWRITTEN_TEXT`), lines, words, and handwriting detection stubs.

### 3. Computer Vision Analysis Layer
- **Provider Abstraction**: `VisionProvider` (`src/lib/digitization/visionProvider.ts`).
- **Structure Recognition**: Detects text blocks, table rows/columns, stamps/seals, signatures, orientation, and cadastral map/diagram sketch regions (`MAP_REGION`, `DIAGRAM_REGION`).
- **Quality Diagnostics**: `DocumentQualityDiagnostic` reporting `resolutionStatus`, `blurStatus`, `skewStatus`, `contrastStatus`, `damageStatus`, `handwritingDetected`, and visual quality warnings.

### 4. Document-Type-Specific Schema Registry
- **Registry**: `DocumentSchemaRegistry` (`src/config/documentSchemaRegistry.ts`) v1.0.
- **Schemas**: Standardized schema definitions for all 6 document types.
- **Common Fields**: `ownerName`, `fatherOrHusbandName`, `surveyNumber`, `subDivisionNumber`, `khataNumber`, `extent`, `landClassification`, `district`, `revenueDivision`, `mandal`, `village`, `documentDate`, `registrationDate`, `mutationReference`, `eastBoundary`, `westBoundary`, `northBoundary`, `southBoundary`.
- **Repeatable Hierarchies**: `parties[]` schema for family partition deeds (Father → Son 1, Son 2) and `boundaries` schema.

### 5. Unified Pre-processing & Processing Pipeline
- **Pre-processing Engine**: `PreprocessingPipeline` (`src/lib/digitization/preprocessingPipeline.ts`) performing page splitting, image normalization, deskewing, and contrast adjustment.
- **Original File Preservation**: Original uploaded PDF/Image files are **never** overwritten or modified.
- **Multi-page & Image Support**: Preserves page order across single/multi-page PDFs and images.
- **Asynchronous API Endpoints**:
  - `POST /api/digitization/pipeline/create`
  - `POST /api/digitization/pipeline/preprocess`
  - `POST /api/digitization/pipeline/ocr`
  - `POST /api/digitization/pipeline/classify`
  - `POST /api/digitization/pipeline/vision`
  - `GET /api/digitization/pipeline/[id]`
- **Processing Statuses**: `UPLOADED`, `PREPROCESSING`, `CLASSIFYING`, `OCR_PROCESSING`, `VISION_PROCESSING`, `READY_FOR_AI_EXTRACTION`, `NEEDS_REVIEW`, `FAILED`.

---

## 3. Non-Goals Preserved for Future Phases
- Final AI land field extraction
- NLP relationship extraction
- Confidence scoring engines
- Human verification checklists
- Field verification photo capture
- KYC integration
- Final digitization submission lock
