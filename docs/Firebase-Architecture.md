# e-Bhoomi — Firebase Integration Architecture

## 1. Executive Summary

This document details the modular architecture for integrating Firebase services into the e-Bhoomi Next.js application. It establishes a secure client configuration, service abstraction layer, role-based access control (RBAC), Firestore collection layout, and storage hierarchy.

---

## 2. Firebase Project Identifiers

| Parameter | Configuration Value |
| :--- | :--- |
| **Project ID** | `e-bhoomi` |
| **Auth Domain** | `e-bhoomi.firebaseapp.com` |
| **Storage Bucket** | `e-bhoomi.firebasestorage.app` |
| **Messaging Sender ID** | `585423835169` |
| **App ID** | `1:585423835169:web:3fa0c44b8dd47e3738d360` |

---

## 3. Client Architecture & Singleton Pattern

Firebase is initialized as a client-side singleton in [client.ts](file:///r:/e-Bhoomi/src/lib/firebase/client.ts) to prevent duplicate initialization during Next.js Hot Module Replacement (HMR) and Server-Side Rendering (SSR).

```
src/lib/firebase/
├── client.ts    # FirebaseApp singleton & config validator
├── auth.ts      # Modular Firebase Auth instance export
├── firestore.ts # Modular Cloud Firestore instance export
└── storage.ts   # Modular Firebase Storage instance export
```

### Server vs. Client Boundary
- Browser SDK code (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`) is isolated inside `src/lib/firebase/` and consumed via client components (`"use client"`).
- Secrets and private keys are **never** exposed in `NEXT_PUBLIC_*` environment variables.

---

## 4. Authentication Architecture

The e-Bhoomi application defines three distinct authentication flows:

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flows                      │
└─────────────────────────────────────────────────────────────┘
                               │
       ┌───────────────────────┼────────────────────────┐
       ▼                       ▼                        ▼
Public User             Authorized Officer         Administrator
Mobile Number           Official Email             Admin Email / ID
       │                       │                        │
       ▼                       ▼                        ▼
Phone OTP Auth          Firebase Auth             Firebase Auth
       │                       │                        │
       ▼                       ▼                        ▼
Firestore User Profile  Firestore Officer Profile  Firestore Admin
Role: PUBLIC_USER       Role & Jurisdiction       Strict MFA Target
```

1. **Public Citizen Authentication**:
   - Primary Method: Phone Number + SMS OTP via `signInWithPhoneNumber()`.
   - Result: Authenticated Firebase user with `PUBLIC_USER` role in Firestore.

2. **Authorized Officer Authentication**:
   - Primary Method: Official credentials issued by system administrators.
   - Result: Auth UID mapped to `officers/{officerId}` document containing designated `roleId` and `jurisdiction`.

3. **Administrator Authentication**:
   - Accessible strictly at `/admin/login`.
   - Architected for multi-factor authentication (MFA).

---

## 5. Firestore Collection Structure

To ensure clean domain boundaries, data is partitioned across specialized collections:

| Collection Path | Purpose | Key Attributes |
| :--- | :--- | :--- |
| `users/{uid}` | Citizen user profiles | `uid`, `email`, `mobile`, `role`, `status`, `createdAt` |
| `officers/{officerId}` | Official officer profiles | `officerId`, `authUid`, `roleId`, `stateId`, `districtId`, `mandalOrTalukId` |
| `roles/{roleId}` | Role metadata & permission maps | `id`, `name`, `defaultPermissions` |
| `permissions/{permId}` | System capability definitions | `code`, `category`, `description` |
| `jurisdictions/{id}` | Administrative hierarchy tree | `level`, `stateId`, `districtId`, `lgdCode` |
| `landRecords/{recordId}` | Digital land records | `surveyNumber`, `subDivisionNumber`, `extent`, `owners`, `verificationStatus` |
| `digitizationCases/{caseId}` | Workflow digitization tasks | `createdBy`, `assignedOfficer`, `ocrStatus`, `reviewStatus` |
| `correctionRequests/{id}` | Citizen/Officer correction items | `recordId`, `requestedBy`, `status`, `reasons` |
| `fieldVerifications/{id}` | VRO ground truth reports | `caseId`, `officerUid`, `remarks`, `fieldBookRef` |
| `auditLogs/{logId}` | Immutable system audit log | `actorUid`, `actorRole`, `action`, `timestamp` |
| `notifications/{id}` | Official bulletin notifications | `title`, `body`, `scope`, `targetJurisdiction` |
| `delegations/{id}` | Temporary delegated authority | `issuerUid`, `targetUserUid`, `targetCaseId`, `expiresAt` |

---

## 6. Storage Architecture & Original Preservation

Documents uploaded into Firebase Storage follow a strict hierarchical structure:

```
/documents/{stateId}/{districtId}/{caseId}/original/{filename}
```

### Document Preservation Policy
- **Immutability**: Original source documents uploaded by field officers are written with `immutable: 'true'` metadata.
- **Client Security**: Direct overwrite or deletion of original documents via client rules is disallowed (`allow update, delete: if false;`).

---

## 7. Security Rules & RBAC Strategy

Firestore and Storage security rules enforce a **strict deny-by-default** stance. Security is enforced on the backend layer rather than relying on frontend UI guards.

- **Firestore Rules**: Located in [firestore.rules](file:///r:/e-Bhoomi/firestore.rules). Inspects auth tokens and cross-checks user roles from `users` or `officers` collections.
- **Storage Rules**: Located in [storage.rules](file:///r:/e-Bhoomi/storage.rules). Restricts file upload sizes to 25MB and requires valid authenticated officer sessions.

---

## 8. Future Server-Side Firebase Admin SDK Roadmap

When server-side operations (such as automated batch processing, privileged user creation, or cron tasks) are required in future phases:

1. **Service Account Safety**: Service account JSON credentials will be stored exclusively in server environment variables (e.g. `FIREBASE_SERVICE_ACCOUNT_KEY`).
2. **Server Route Handlers**: Calls will execute inside Next.js API Route Handlers or Server Actions under `app/api/`.
3. **No Browser Exposure**: Admin SDK binaries and private keys will never be imported in client-side code.
