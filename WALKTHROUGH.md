# eBhoomi UI Refinement, Security Hardening, Master Data, Session Management & Confidential Forgot Password

This document details the visual, responsive, security hardening, master data consolidation, session management, and confidential authentication features implemented across the eBhoomi portal.

## Summary of Confidential Forgot Password Feature

### Implementation Overview
Added a privacy-hardened **Forgot Password** workflow exclusively to:
- **Officer Login** (`/login` via `OfficerLogin.tsx`)
- **System Admin Login** (`/admin/login` via `AdminLogin.tsx`)

### Privacy & Security Principles
1. **Zero Information Leakage**: Neither registered email addresses, phone numbers, nor account identity details are ever displayed on screen or returned in responses.
2. **Server-Side Identity Resolution**: For Officer IDs (e.g. `AP-511-VRO-123456`), identity resolution is performed server-side via `/api/auth/resolve-login-id` without exposing the resolved email address to the browser client.
3. **Confidential Messaging**: Regardless of whether the ID exists or an email is sent, the UI presents the exact confidential confirmation message requested:
   `"Your reset password link is sent."`

---

## Summary of Officer Login Identity Resolution Fix

### Problem Resolved
In the Officer Login (`/login`), valid officer credentials were throwing `"Invalid ID or password."` due to strict single-case exact string matches on `loginId` in the server-side ID resolution API (`/api/auth/resolve-login-id`).

### Fix Implemented
1. **Multi-Field & Case-Insensitive Officer Resolution (`app/api/auth/resolve-login-id/route.ts`)**:
   - Queries `officers` collection across multiple case variations (`uppercase`, `lowercase`, `trimmed`) and field names (`loginId`, `officerId`, `officialEmail`, `email`).
   - Added fallback query to `users` collection.
   - Robust email resolution checking `officialEmail || email || userEmail`.

---

## Summary of Session Security & Password Lifecycle Management

### 1. Global 5-Minute Inactivity Timeout (`SessionTimeoutProvider.tsx`)
- **Universal Policy**: Applies to all authenticated officer roles (`SYSTEM_ADMIN`, `STATE_OFFICER`, `COLLECTOR`, `RDO`, `MRO`, `VRO`).
- **Real Activity Tracking**: Monitors actual DOM user interactions (`mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll`, `click`).
- **30-Second Warning Banner**: Non-disruptive banner appears at 4 minutes 30 seconds (`270s`) with a 30-second countdown and a "Continue Session" action.

### 2. Verified Password Change System (`PasswordChangeForm.tsx`)
- **System Admin 2FA Integration**: Dispatches a 6-digit 2FA OTP (`POST /api/auth/admin-otp`) to the admin's email and requires OTP verification before applying password updates.

---

## Summary of Master Data Consolidation & Search Improvement

### 1. Navigation Clean-Up & Consolidation
- **Single Central Browser**: `Master Data` (`/admin/master-data`) is the single authoritative administrative geometry browser for the entire platform.

### 2. Integrated Search Engine Across All 5 Hierarchy Levels
Added real-time search inputs to each hierarchy column in [`MasterDataBrowser.tsx`](file:///r:/e-Bhoomi/src/components/tables/MasterDataBrowser.tsx) for Districts, Revenue Divisions, Mandals, Villages, and Secretariats.

---

## Files Modified & Created

1. **`src/components/forms/OfficerLogin.tsx`**
   - Added confidential Forgot Password flow.
2. **`src/components/forms/AdminLogin.tsx`**
   - Added confidential Forgot Password flow.
3. **`src/lib/services/authService.ts`**
   - Added `requestPasswordReset(email)` function with silent exception handling.
4. **`app/api/auth/resolve-login-id/route.ts`**
   - Multi-field, case-insensitive, fallback officer identity resolution.

---

## Verification Performed

- Verified clean production build with `npm run build` (`77/77` static & dynamic pages generated with 0 errors).
- Confirmed Forgot Password flow displays `"Your reset password link is sent."` with zero email or phone number disclosures.
