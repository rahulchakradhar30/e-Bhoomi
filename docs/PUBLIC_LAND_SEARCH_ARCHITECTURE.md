# Public Land Search & VRO Digitization Integration Architecture

## 1. Architectural Overview

The **e-Bhoomi** portal connects the internal Village Revenue Officer (VRO) land-record digitization pipeline with the public-facing homepage land search. This ensures that every land record discovered by citizens originates from authentic, physically verified, and officer-approved digitization records saved in Firestore.

```
+-----------------------------------------------------------------------------------+
|                            VRO DIGITIZATION PIPELINE                              |
|  1. Upload Original Document (Adangal, RoR-1B, Mutation, Passbook, Partition)     |
|  2. OpenCV Deskew & CLAHE Preprocessing + Multimodal Llama/Groq AI Extraction      |
|  3. Extraction Review:                                                            |
|     - District, Mandal, Village extracted & resolved against Master Data          |
|     - Revenue Division: [MANUAL SELECTION REQUIRED]                               |
|     - Strict Validation: Mandal must belong to selected Revenue Division          |
|  4. Field Physical Verification (Min 4 Geotagged Inspection Photos)               |
|  5. Final Officer Legal Declaration & Permanent Digitization Lock                 |
|  6. Firestore Persistence:                                                        |
|     - digitizationCases (Internal workflow, audit trail, consent, photos)        |
|     - landRecords (Official canonical land record index)                          |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        PUBLIC HOMEPAGE CITIZEN SEARCH                             |
|  1. Step 1: Location Hierarchy Cascading Selection                                |
|     - State: Andhra Pradesh (28)                                                  |
|     - District: Kurnool (511)                                                     |
|     - Revenue Division: Adoni / Kurnool / Pattikonda                              |
|     - Mandal: [Dependent on Revenue Division]                                     |
|     - Village / Sachivalayam: [Dependent on Mandal]                               |
|  2. Step 2: Survey Number Discovery                                               |
|     - Real-time database query for verified records in selected jurisdiction      |
|     - ZERO fake/demo survey numbers                                               |
|     - Professional Empty State if no digitized records exist                      |
|  3. Step 3: Verified Records List & Read-Only Inspection Modal                     |
|     - Survey No., Sub-Division, Khata No., Extent, Land Type, Record Type         |
|     - Read-only inspection; public users cannot edit, mutate, or upload           |
+-----------------------------------------------------------------------------------+
```

---

## 2. Administrative Location Hierarchy

The e-Bhoomi system enforces a 5-tier authoritative administrative hierarchy derived from Local Government Directory (LGD) master datasets:

$$\text{State (28)} \longrightarrow \text{District (511)} \longrightarrow \text{Revenue Division} \longrightarrow \text{Mandal} \longrightarrow \text{Village / Sachivalayam}$$

### Revenue Division Integration in VRO Workflow:
- **Requirement**: While District, Mandal, and Village information are extracted from revenue documents, **Revenue Division** is an administrative boundary that must be manually designated by the VRO.
- **Authoritative Pool**:
  - `RD-511-ADONI`: Adoni Revenue Division (Mandals: Adoni, Gonegandla, Holagonda, Kosigi, Kowthalam, Mantralayam, Peddakadubur)
  - `RD-511-KURNOOL`: Kurnool Revenue Division (Mandals: C-Belagal, Gudur, Kallur, Kodumur, Kurnool Urban, Orvakal, Veldurthi)
  - `RD-511-PATTIKONDA`: Pattikonda Revenue Division (Mandals: Alur, Aspari, Devanakonda, Chippagiri, Halaharvi, Krishnagiri, Maddikera, Pattikonda, Tuggali)
- **Deterministic Validation**:
  - If Revenue Division is not selected: Submission is blocked with the error `"Please select the Revenue Division before submitting the digitized record."`
  - If Mandal does not belong to the selected Revenue Division: Submission is blocked with `"Validation Error: Mandal belongs to another Revenue Division."`

---

## 3. Data Model & Firestore Persistence

### Internal vs. Public Separation

| Field Category | `digitizationCases` (Internal Officer Collection) | `landRecords` / Public View Model |
| :--- | :--- | :--- |
| **Identifiers** | `caseId`, `officerId`, `assignedOfficer` | `recordId`, `sourceRecordReference` |
| **Location Data** | `stateCode`, `districtCode`, `divisionCode`, `mandalCode`, `villageCode` | Complete hierarchy with human-readable names and codes |
| **Land Parcel** | Extracted fields, confidence scores, evidence quotes | `surveyNumber`, `subDivisionNumber`, `khataNumber`, `extent`, `landClassification` |
| **Audit Trail** | Officer action timeline, IP, signatures, KYC status | Omitted from public view |
| **Field Verification**| Raw inspection photos & metadata | Verified status flag only |
| **Security Scope** | Officer authenticated only (`matchesDistrictScope`) | Read-only public query for `VERIFIED` records |

---

## 4. Public Search Query Strategy & Zero Demo Data Policy

1. **Elimination of Mock Dictionaries**:
   - The hardcoded mock dictionary `kurnoolSurveyNumbers` has been removed.
   - Fallback mock objects in `fetchPublicLandRecords` have been removed.
2. **Dynamic Survey Discovery**:
   - Client issues `GET /api/public/land-records?districtId=...&mandalId=...&villageId=...&type=surveys`.
   - The backend queries verified records in Firestore and returns distinct available survey numbers.
3. **Record Search Query**:
   - Location-constrained query: `districtId == ... AND mandalOrTalukId == ... AND villageId == ... AND surveyNumber == ... AND verificationStatus in ['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED']`.
4. **Empty State Experience**:
   - If no records have been digitized for the selected location, clear and helpful messaging is rendered:
     `"No Digitized Records Found. The selected location does not currently contain any verified digitized land records."`

---

## 5. Security & Read-Only Governance

- **Read-Only Citizen Access**: Citizens can only query and view sanitized public record views.
- **Mutation Impossibility**: Public UI contains no edit fields, deletion triggers, upload endpoints, or status manipulation tools.
- **Firestore Security Rules**:
  ```javascript
  match /landRecords/{recordId} {
    allow read: if isSignedIn() || resource.data.verificationStatus in ['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED'];
    allow create, update: if isOfficer() && matchesDistrictScope();
    allow delete: if false;
  }
  ```
- **Backend Admin SDK Proxying**: Next.js route `/api/public/land-records` sanitizes all returned records and discards sensitive internal metadata before responding to citizen browsers.
