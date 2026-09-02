# e-Bhoomi — Session Security & Password Lifecycle Management

**Document Version**: 1.0.0  
**Target Environment**: Production (Government of India / NIC e-Governance Platform)  
**Last Updated**: September 2026  

---

## 1. Executive Summary & Session Policy Overview

Every authenticated officer across all administrative roles (`SYSTEM_ADMIN`, `STATE_ADMIN`, `DISTRICT_COLLECTOR`, `RDO_OFFICER`, `TAHSILDAR_MRO`, `FIELD_VRO`) is governed by an automated session security policy:

1. **5-Minute Continuous Inactivity Limit**: 5 minutes (`300,000ms`) of no user interaction triggers automatic session invalidation, user sign-out, state destruction, and redirection to login.
2. **270s Warning Banner**: A non-disruptive warning appears at 4 minutes 30 seconds (`270s`) with a 30-second countdown and a "Continue Session" action.
3. **Session-Scoped Persistence**: Privileged administrative access uses session-scoped storage (`browserSessionPersistence`) so closing the browser/tab requires fresh authentication without persisting unrestricted long-lived sessions.
4. **Verified Password Management**: Password changes for all roles require fresh identity verification (2FA/OTP for System Admin, fresh authentication verification for Officers). Old sessions are immediately revoked upon successful password update.

---

## 2. Five-Minute Inactivity Timeout Specification

### Real User Activity Criteria
The session timer is updated **exclusively** by genuine DOM user interaction events:
- `mousemove`
- `mousedown`
- `keydown`
- `touchstart`
- `scroll`
- `click`

### Non-Activity Events (Excluded)
The inactivity timer is **never** reset by background events, including:
- Firebase background token refreshes (`getIdToken(true)`).
- Asynchronous API polling.
- Firestore realtime collection listeners (`onSnapshot`).
- Page rendering or background timer ticks.

---

## 3. Session Warning & Auto-Logout Flow

```
[ Active User Interaction ]
           │
           │ (No DOM input for 4.5 minutes)
           v
[ 30-Second Warning Banner Displayed ] ──( User Clicks "Continue" )──> [ Timer Reset ]
           │
           │ (No user action for remaining 30 seconds)
           v
[ Automatic Session Termination ]
  1. Broadcast LOGOUT event across all browser tabs
  2. Execute firebaseSignOut(auth)
  3. Clear in-memory state & tokens
  4. Redirect to /login or /admin/login
```

---

## 4. Multi-Tab & Cross-Window Synchronization

### Implementation Mechanism
- When a user signs out or experiences an inactivity timeout in Tab A, a cross-tab event payload is broadcast via `window.localStorage`:
  ```json
  { "action": "LOGOUT", "reason": "INACTIVITY", "timestamp": 1788365400000 }
  ```
- All open tabs listening to the `storage` event decode the signal, clear local authenticated state, and redirect immediately to the login interface. Stale tabs cannot perform administrative operations.

---

## 5. Mobile & Suspended Tab Revalidation

### Handling Mobile Page Suspension (iOS Safari / Android Chrome)
- Mobile operating systems frequently suspend or freeze background tabs without firing `beforeunload` or `unload` events.
- To guarantee security, `SessionTimeoutProvider` attaches a `visibilitychange` listener:
  ```typescript
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= 5 * 60 * 1000) {
        handleSessionLogout('INACTIVITY');
      }
    }
  });
  ```
- When a user resumes a backgrounded tab after $\ge 5$ minutes, the session is revalidated and invalidated immediately before any content is rendered.

---

## 6. Officer Password Lifecycle & Verified Update Workflow

### Verified Password Change Flow
```
[ Authenticated Profile / TopBar ]
               │
               ▼
   Select "Change Password"
               │
               ▼
[ Enter New Password + Confirm ]
               │
               ▼
  ( Is User System Admin? )
    ├── YES ──> [ Dispatch 2FA OTP to Email ] ──> [ Verify 6-Digit OTP ]
    └── NO  ──> [ Fresh Identity Verification ]
               │
               ▼
[ Execute firebaseUpdatePassword() ]
               │
               ▼
[ Update Firestore Profile (mustChangePassword = false) ]
               │
               ▼
[ Invalidate Sessions & Sign Out ] ──> Redirect to Login
```

---

## 7. Audit Logging & Security Events

All session and credential lifecycle events are recorded as immutable audit entries:
- `USER_LOGIN_SUCCESS`
- `USER_LOGOUT_EXPLICIT`
- `SESSION_TIMEOUT_INACTIVITY`
- `PASSWORD_CHANGED_SUCCESS`
- `PASSWORD_CHANGE_OTP_VERIFIED`

*Note: Passwords, OTP codes, private keys, and authentication tokens are strictly excluded from audit logs.*

---

## 8. Verification & Acceptance Testing Suite

| Test Case | Description | Procedure | Expected Result | Status |
|---|---|---|---|---|
| **TEST 1** | 5-Minute Inactivity Timeout | Do not touch mouse/keyboard for 5 minutes | Warning banner at 4m30s; automatic logout at 5m | ✅ PASS |
| **TEST 2** | Continuous Activity Test | Interact continuously with mouse/keyboard | Session remains active without premature logout | ✅ PASS |
| **TEST 3** | Multi-Tab Logout | Log out in Tab A while Tab B is open | Tab B detects logout signal and redirects to login | ✅ PASS |
| **TEST 4** | Suspended Tab Return | Background tab on mobile for 6 minutes, then switch back | Immediate session revalidation & logout | ✅ PASS |
| **TEST 5** | System Admin Password 2FA | Change password in Admin Profile | Dispatches 2FA OTP; requires OTP code before update | ✅ PASS |
| **TEST 6** | Back Button Protection | Press browser Back after logout | Protected dashboard remains inaccessible | ✅ PASS |
