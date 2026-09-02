# e-Bhoomi — Production Security Architecture & Threat Model

**Document Version**: 1.0.0  
**Target Environment**: Production (Government of India / NIC e-Governance Platform)  
**Last Updated**: September 2026  

---

## 1. Executive Summary & Core Security Principle

The **e-Bhoomi** security model operates under a zero-trust client assumption: **The browser environment is completely untrusted and observable.**

### Primary Rule of Authorization
Security boundaries are **never** enforced via browser-side code, hidden UI components, JavaScript variables, or DevTools detection. All access control decisions are strictly and independently enforced by:
- Server-side Firebase ID Token verification (`Admin SDK`).
- Firebase Auth Custom Claims (`role`, `districtId`, `stateId`).
- Deny-by-default Cloud Firestore Security Rules.
- Protected Next.js Server API Routes.
- Immutable Audit Logs.

---

## 2. Threat Model & Untrusted Browser Policy

### Untrusted Client Assumptions
An attacker or malicious user can:
1. Open Browser Developer Tools (`F12`, `Ctrl+Shift+I`, Inspect Element).
2. Inspect, modify, or replay all network HTTP requests.
3. Mutate client-side React state, localStorage, sessionStorage, or DOM elements (e.g., setting `role = "SYSTEM_ADMIN"`).
4. Extract all public frontend source code and JavaScript bundles.
5. Invoke backend REST API endpoints directly via `curl` or Postman.

### Security Guarantees
- **Role Forgery Prevention**: Setting `role = "SYSTEM_ADMIN"` in client state grants 0 access to server resources. The backend checks `request.auth.token.role` (signed by Firebase Auth server).
- **IDOR / Jurisdiction Protection**: Modifying `districtId` or `mandalId` in request payloads returns `HTTP 403 Forbidden` unless the user's custom claim grants access.
- **Zero Exposed Secrets**: `FIREBASE_ADMIN_PRIVATE_KEY`, `GMAIL_APP_PASSWORD`, and service account keys are stored server-side and never prefixed with `NEXT_PUBLIC_*`.

---

## 3. Client-Side Non-Interference & DevTools Policy

### Policy Guidelines
1. **No Fragile DevTools Detection**: e-Bhoomi does **not** rely on window size monitoring, `debugger` traps, or `contextmenu` blocking as security mechanisms.
2. **Universal Compatibility**: Normal browser functionality is preserved across Chrome, Firefox, Safari (macOS & iOS), and Android devices without false positives.
3. **Defense in Depth**: The system remains secure when Developer Tools are open because authorization is strictly server-enforced.

---

## 4. Authentication Architecture

### Dual-Layer Identity Verification

```
+-----------------------------------------------------------------------+
|                            PUBLIC USER                                |
+-----------------------------------------------------------------------+
                                   |
                1. Submit Login ID (e.g. AP-511-VRO-123456)
                                   v
+-----------------------------------------------------------------------+
|  POST /api/auth/resolve-login-id (Server-Side ID Resolution)          |
|  - Queries officer mapping collection                                 |
|  - Returns official email + authentication policy                     |
+-----------------------------------------------------------------------+
                                   |
                2. Authenticate Email + Password
                                   v
+-----------------------------------------------------------------------+
|  Firebase Auth Engine                                                 |
|  - Validates credentials                                              |
|  - Issues signed RS256 JWT ID Token containing trusted Custom Claims  |
+-----------------------------------------------------------------------+
```

---

## 5. System Admin Two-Factor Authentication (2FA / OTP)

### 2FA Lifecycle Specification
1. **Primary Authentication**: Admin submits System Admin ID and Password. Firebase Auth validates credentials.
2. **Server-Side OTP Generation**:
   - Next.js API route (`POST /api/auth/admin-otp`) verifies caller has administrative privileges (`SYSTEM_ADMIN` or `STATE_ADMIN`).
   - Generates a cryptographically random 6-digit numeric OTP.
   - Stores hashed OTP in `adminOtpSessions/{uid}` with a strict 5-minute TTL (`300s`).
   - Dispatches single-use OTP to the administrator's registered email address.
3. **Secondary Factor Verification**:
   - Admin submits OTP to `PUT /api/auth/admin-otp`.
   - Backend enforces rate limiting (maximum 5 failed attempts before session invalidation).
   - Upon successful verification, session record is deleted immediately (preventing OTP reuse).
   - Immutable audit log entry (`ADMIN_LOGIN_2FA_SUCCESS`) is generated.

---

## 6. Role-Based Access Control (RBAC) & Custom Claims

| Role Code | Tier Level | Scope Boundary | Description |
|---|---|---|---|
| `SYSTEM_ADMIN` | Level 0 | Platform-wide | Full system administration, master data, security settings |
| `STATE_ADMIN` / `STATE_OFFICER` | Level 1 | State-wide | Monitoring, state reports, cross-district audits |
| `DISTRICT_COLLECTOR` / `DISTRICT_ADMIN` | Level 2 | District-wide | District oversight, officer management, transfer approvals |
| `RDO_OFFICER` / `RDO` | Level 3 | Revenue Division | Division monitoring, dispute cases, Tahsildar oversight |
| `TAHSILDAR_MRO` / `MRO` | Level 4 | Mandal-wide | Mandal approvals, field verifications, village records |
| `FIELD_VRO` / `FIELD_OFFICER` | Level 5 | Sachivalayam/Village | Land record digitization, field data entry, survey verification |

---

## 7. Hierarchical Jurisdiction Access Control

Access to land records, digitization cases, and officer profiles is bound by administrative hierarchy:

$$\text{State} \longrightarrow \text{District} \longrightarrow \text{Revenue Division} \longrightarrow \text{Mandal} \longrightarrow \text{Village / Sachivalayam}$$

- An MRO assigned to Mandal A cannot read/modify records belonging to Mandal B.
- A District Collector assigned to District X cannot modify officers or records in District Y.
- Jurisdiction claims (`stateId`, `districtId`) are injected into the signed JWT ID Token and verified on every database read/write.

---

## 8. Insecure Direct Object Reference (IDOR) Mitigation

### Protection Mechanisms
1. **Firestore Security Rules**: Rules inspect `request.auth.token.districtId` against document fields (`resource.data.districtId`).
2. **API Route Validation**: Every custom REST endpoint decodes the Authorization Bearer Token using `adminAuth.verifyIdToken()` and confirms resource ownership before executing transactions.

---

## 9. Cloud Firestore Security Rules

### Key Rule Specifications ([`firestore.rules`](file:///r:/e-Bhoomi/firestore.rules))
- **Default Deny**: `match /{document=**} { allow read, write: if false; }`
- **Admin OTP Sessions**: `match /adminOtpSessions/{sessionId} { allow read, write: if false; }` (Server-side Admin SDK only).
- **Officer Profiles**: `allow update: if isAdmin() || (isSignedIn() && uid() == officerId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['mustChangePassword', 'updatedAt']));`
- **Audit Logs**: Immutable append-only (`allow update, delete: if false;`).

---

## 10. Custom Backend API Authorization

All API endpoints (`/api/admin/*`, `/api/state/*`) require an Authorization header:
```http
Authorization: Bearer <Firebase_ID_Token>
```
Server-side validation sequence:
1. Verify token signature with `adminAuth.verifyIdToken(token)`.
2. Extract claims (`role`, `districtId`).
3. Query `admins` or `users` collection to confirm active account status.
4. Reject unauthorized calls with `HTTP 401 Unauthorized` or `HTTP 403 Forbidden`.

---

## 11. Session Management & Idle Timeout Policy

1. **Idle Timeout**: 15 minutes of inactivity prompts reauthentication for privileged workspace sessions.
2. **Revocation on Account Disable**: Account status updates (`SUSPENDED` / `DISABLED`) take effect immediately on subsequent API calls.
3. **First-Time Login Force Change**: Accounts with `mustChangePassword: true` are restricted to password update routes (`/auth/change-password`).

---

## 12. Rate Limiting & Brute-Force Throttling

- **OTP Verification Rate Limit**: Maximum 5 attempts per OTP session before automatic session destruction.
- **OTP Resend Cooldown**: 60-second client-side & server-enforced cooldown.
- **Generic Error Responses**: Authentication errors return `Invalid ID or password.` to prevent username/email enumeration attacks.

---

## 13. HTTP Production Security Headers

Configured in [`next.config.mjs`](file:///r:/e-Bhoomi/next.config.mjs):

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforce HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protect URL parameters in referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unneeded hardware features |

---

## 14. Secrets Management & Environment Variable Isolation

### Secret Classification
- **Public Variables (`NEXT_PUBLIC_*`)**: Firebase API Key, Project ID, Auth Domain, Storage Bucket. Safe for client JS bundle inclusion.
- **Server-Only Variables**:
  - `FIREBASE_ADMIN_PRIVATE_KEY`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `GMAIL_APP_PASSWORD`

---

## 15. Audit Logging

All privileged administrative and security operations generate immutable audit events stored in `auditLogs`:
- `ADMIN_LOGIN_2FA_SUCCESS`
- `OFFICER_CREATED`
- `OFFICER_TRANSFERRED`
- `OFFICER_DEACTIVATED`
- `PASSWORD_CHANGED`

---

## 16. Security Testing & Acceptance Suite

| Test Case | Procedure | Expected Result | Status |
|---|---|---|---|
| **TEST 1** | Open DevTools on System Admin Login | Login works normally; no forced reload/blocking | ✅ PASS |
| **TEST 2** | Mutate `role = "SYSTEM_ADMIN"` in client React state | API routes return `HTTP 403 Forbidden` | ✅ PASS |
| **TEST 3** | Access another Mandal's record ID directly | Firestore Security Rules reject read (`HTTP 403`) | ✅ PASS |
| **TEST 4** | Submit expired or reused 2FA OTP | API returns `HTTP 400` / `otp/expired` | ✅ PASS |
| **TEST 5** | Send API request without Bearer token | API returns `HTTP 401 Unauthorized` | ✅ PASS |
| **TEST 6** | Execute 6 incorrect OTP attempts | OTP session auto-invalidated (`HTTP 429`) | ✅ PASS |
