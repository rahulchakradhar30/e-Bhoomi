# e-BHOOMI NEW DIGITIZATION WORKFLOW & ARCHITECTURE MANUAL

## 1. Overview & Core Philosophy
The e-BHOOMI New Digitization Workflow establishes an assistive, human-in-the-loop land record digitization pipeline.

### Core Principle
- **VRO Physical Verification & Consent**: Physical documents received by Village Revenue Officers (VROs) are verified before digital upload.
- **Assistive AI Role**: Multi-lingual OCR and AI document extraction act strictly as assistive automation engines. AI **does not** independently determine legal title or make final land ownership conclusions.
- **Officer Final Responsibility**: The authorized officer remains the legal decision maker who verifies, corrects, and approves digitized land records.

---

## 2. Supported Document Categories & Extraction Schemas
The initial system supports six standardized land record document categories:

1. **Adangal (అడంగల్)**: Village land possession, land classification, and cultivation record.
2. **RoR-1B / Record of Rights (ఆర్.ఓ.ఆర్ – 1-బి / హక్కుల రికార్డు)**: Primary legal record of rights, Khata details, and survey extents.
3. **Mutation / Name Transfer Record (మ్యూటేషన్ రికార్డు / పేరుమార్పు రికార్డు)**: Revenue proceedings ordering title transfer after sale, gift, or inheritance.
4. **Partition / Succession Record (విభజన / వారసత్వ రికార్డు)**: Inheritance hierarchy (e.g. Father → Son 1, Son 2) specifying individual shares, survey sub-divisions, and extents.
5. **Pattadar Passbook / Title Deed (పట్టాదారు పాస్బుక్ / టైటిల్ డీడ్)**: Official government passbook containing Pattadar details and land schedule.
6. **Legacy Revenue Record (పాత రెవెన్యూ రికార్డు)**: Historical settlement registers, Fair Adangal, Inam registers, or Nizam Sethwar records.

Each category defines expected common land fields (Pattadar Name, Father/Husband Name, Survey/Sub-Division Number, Khata Number, Extent, Land Class, Village, Mandal, Division, District), four-side boundaries (East, West, North, South), repeatable party share structures (for partition documents), and category verification checklists.

---

## 3. 9-Phase Digitization Workflow

### Phase 1 — VRO Consent
- Multilingual toggle supporting **English Only** and **English + Telugu Paired**.
- In Telugu mode, each English sentence is displayed first, followed immediately by its paired Telugu translation sentence underneath.
- Mandatory physical document check confirmation and officer responsibility declaration.
- Disables wizard advancement until all checkboxes are accepted.

### Phase 2 — Document Type Selection
- VRO selects one of the 6 supported land record categories.
- Anchors the extraction schema and checklist for subsequent processing.

### Phase 3 — Secure Document Upload
- Prefers multi-page PDF files to preserve original revenue register page order.
- Supports PDF, JPG, JPEG, and PNG formats.
- Server-side MIME validation, size limit enforcement (25MB max), and cryptographic storage reference generation (`/api/digitization/upload`).

### Phase 4 & 5 — Processing & OCR
- Multi-lingual OCR execution (`OCRProvider`) for Telugu and English.
- Preserves original document files while returning line/word/page confidence and text coordinates.

### Phase 6 & 7 — Document Understanding & Structured AI Extraction
- `AIExtractionProvider` maps OCR text into structured JSON matching document schemas.
- Field-level confidence scores (0.0 to 1.0) and source page/text evidence tracking (`sourcePage`, `sourceText`).

### Phase 8 — VRO Review & Correction Workspace
- **Desktop**: Two-panel layout with `DocumentViewer` (zoom, rotate, page nav) on Left and AI extracted fields on Right.
- **Mobile**: Responsive tabbed layout (`Original Document` vs `Extracted Data`) supporting screen widths from 320px up to 1920px.
- **Audit Trace**: Mandatory `Correction Reason` input whenever a VRO modifies an AI value, creating an immutable audit log (`originalAIValue`, `correctedValue`, `correctionReason`, `correctedBy`, `timestamp`).

### Phase 9 — Field Verification
- VRO performs physical land inspection.
- **Minimum 4 Photographs Required**: Upload timestamped photos or use live HTML5 camera capture (`capture="environment"`).
- Tracks photo metadata (photoId, fileName, storageReference, timestamp, officerId).

### Phase 10 — Citizen KYC Integration Module
- Integration-ready `KYCProvider` displaying transparent status (`UNAVAILABLE`, `PENDING`, `VERIFIED`).
- Does **not** simulate fake Aadhaar OTP or unauthorized UIDAI calls.

### Phase 11 & 12 — Final Review & Final Consent
- Complete summary of digitized record, boundaries, VRO corrections, field photos count, and original document preview link.
- Final consent declaration & mandatory checkboxes.
- **Final Submission Lock**: Permanent record lock preventing direct frontend editing post-submission.

---

## 4. Confidence-Based Routing & Firestore Data Model
- Records meeting confidence thresholds (>=75%) and complete checklists are finalized as `DIGITIZED`.
- Records with low confidence or discrepancies route to `PENDING_HIGHER_REVIEW` for Tahsildar / MRO review queue in `/officer/review`.
- All digitization records are persisted in Firestore `digitizationCases` collection under state, district, and mandal jurisdiction boundaries.

---

## 5. Security & Credentials
- All OCR, AI, Cloud Storage, and KYC integration credentials remain strictly server-side.
- No secrets exposed in browser client code or `NEXT_PUBLIC_*` variables.
