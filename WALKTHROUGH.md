# eBhoomi UI Refinement, Security Hardening, Master Data & Session Management

This document details the visual, responsive, security hardening, master data consolidation, and session management refinements implemented across the eBhoomi portal.

## Summary of Session Security & Password Lifecycle Management

### 1. Global 5-Minute Inactivity Timeout (`SessionTimeoutProvider.tsx`)
- **Universal Policy**: Applies to all authenticated officer roles (`SYSTEM_ADMIN`, `STATE_OFFICER`, `COLLECTOR`, `RDO`, `MRO`, `VRO`).
- **Real Activity Tracking**: Monitors actual DOM user interactions (`mousemove`, `mousedown`, `keydown`, `touchstart`, `scroll`, `click`). Background network calls or timers do not reset the inactivity clock.
- **30-Second Warning Banner**: Non-disruptive banner appears at 4 minutes 30 seconds (`270s`) with a 30-second countdown and a "Continue Session" action before auto-logout at 5 minutes (`300s`).
- **Multi-Tab Synchronization**: Cross-tab logout events broadcast via `window.localStorage` so logging out in one tab immediately logs out all other open tabs.
- **Suspended Mobile Tab Revalidation**: Revalidates elapsed inactivity time on `visibilitychange` when returning to a backgrounded tab.

### 2. Verified Password Change System (`PasswordChangeForm.tsx`)
- **Profile Integration**: Accessible via Profile / TopBar for all authenticated roles.
- **Fresh Verification**: Does not require entering old password when fresh identity verification is completed.
- **System Admin 2FA Integration**: Dispatches a 6-digit 2FA OTP (`POST /api/auth/admin-otp`) to the admin's email and requires OTP verification before applying password updates.
- **Session Revocation**: Automatically revokes old authenticated sessions upon password update and requires a fresh login with the new credentials.

---

## Summary of Master Data Consolidation & Search Improvement

### 1. Navigation Clean-Up & Consolidation
- **Removed Duplicate Geography Links**: Removed redundant `Districts`, `Revenue Divisions`, `Subdistricts`, and `Villages` from System Admin top navigation (`layout.tsx`).
- **Single Central Browser**: `Master Data` (`/admin/master-data`) is now the single authoritative administrative geometry browser for the entire platform.
- **Safe Route Redirection**: Old routes (`/admin/districts`, `/admin/revenue-divisions`, `/admin/subdistricts`, `/admin/villages`) perform server-side redirects to `/admin/master-data` via `redirect()`, protecting bookmarks.

### 2. Integrated Search Engine Across All 5 Hierarchy Levels
Added real-time search inputs to each hierarchy column in [`MasterDataBrowser.tsx`](file:///r:/e-Bhoomi/src/components/tables/MasterDataBrowser.tsx):
- **Search Districts**: Filters district list by English name, Telugu name, LGD code.
- **Search Revenue Divisions**: Filters divisions by name, local name, division code.
- **Search Mandals**: Filters subdistricts by name, type, LGD code.
- **Search Villages**: Filters villages by name, local name, LGD code.
- **Search Secretariats**: Filters secretariats by Sachivalayam name, code, locality name, and local name.

---

## Summary of Production Security Hardening

### 1. Server-Authoritative Access Control & Untrusted Client Policy
- **Zero Client Trust**: All security authorization boundaries are enforced authoritatively via Firebase Auth Custom Claims (`role`, `districtId`, `stateId`), server-side API ID token verification, and deny-by-default Cloud Firestore Security Rules.
- **DevTools Non-Interference**: Security is enforced at backend/database boundaries without relying on fragile DevTools traps.
- **IDOR Protection**: Added `matchesDistrictScope()` checks in `firestore.rules`.

### 2. HTTP Production Security Headers
Configured production HTTP response security headers in `next.config.mjs` (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy).

---

## Files Modified & Created

1. **`src/components/auth/SessionTimeoutProvider.tsx`** [NEW]
   - 5-minute inactivity session manager, 30s warning banner, multi-tab sync.
2. **`src/components/forms/PasswordChangeForm.tsx`**
   - Verified password change system with System Admin 2FA OTP integration.
3. **`docs/SESSION_AND_PASSWORD_SECURITY.md`** [NEW]
   - Session & Password Security documentation.
4. **`src/lib/services/authService.ts`**
   - Configured `browserSessionPersistence`.
5. **`app/layout.tsx`**
   - Wrapped RootLayout with `SessionTimeoutProvider`.

---

## Verification Performed

- Verified clean compilation with `npm run build`.
- Confirmed 5-minute inactivity timer, 30s warning banner, and multi-tab logout functionality.
- Tested verified password change flow with System Admin 2FA OTP step.
