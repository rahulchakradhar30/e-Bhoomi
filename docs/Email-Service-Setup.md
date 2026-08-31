# e-Bhoomi — Email Service Setup Guide

## Overview

The e-Bhoomi platform uses **Nodemailer** on the Next.js server to dispatch
administrative emails — including officer account provisioning credentials.

**Sender Account**: `eBhoomi.ap@gmail.com`  
**Transport**: Gmail SMTP + Google App Password  
**Runtime**: Next.js server route handlers (Node.js) — **never the browser**

---

## 1. Gmail Account Configuration

The dedicated sender account is:

```
eBhoomi.ap@gmail.com
```

This account is an **application mail sender** only. It is separate from:
- the System Administrator login identity (`BOOTSTRAP_ADMIN_EMAIL`)
- individual officer accounts

### Enabling Google App Passwords

Google App Passwords require 2-Step Verification to be active on the account:

1. Sign in to [myaccount.google.com](https://myaccount.google.com)
2. Go to **Security → 2-Step Verification** and enable it.
3. Return to Security and open **App passwords**.
4. Create a new app password (name it e.g., `e-Bhoomi MVP`).
5. Copy the displayed 16-character code.

> [!CAUTION]
> Never use your normal Gmail account password. Only ever use a dedicated
> App Password in `GMAIL_APP_PASSWORD`.

---

## 2. Environment Variables

Add the following to `.env.local` (local development) or your hosting
platform's secure environment-secret store (production):

```env
# Server-side only — never use NEXT_PUBLIC_* for these
GMAIL_USER=eBhoomi.ap@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

> [!IMPORTANT]
> `GMAIL_APP_PASSWORD` must **never** appear in:
> - Source code
> - Git history
> - README or documentation
> - Client-side JavaScript / browser bundles
> - Firestore database
> - Application logs

### App Password Rotation

If the App Password needs to be revoked and regenerated:
1. Revoke the old App Password in your Google Account security settings.
2. Generate a new 16-character App Password.
3. Update `GMAIL_APP_PASSWORD` in your environment secrets.
4. **No source code changes are required.**

---

## 3. Architecture

```
Admin triggers officer creation
         ↓
/api/admin/officers (Next.js server route)
         ↓
Firebase Auth: create user + set claims
         ↓
Firestore: write officer profile (mustChangePassword=true)
         ↓
Nodemailer → Gmail SMTP (eBhoomi.ap@gmail.com)
         ↓
Officer receives credential email
```

The browser **never** connects to Gmail. All SMTP activity happens
exclusively inside Next.js server route handlers.

---

## 4. Email Delivery Result Handling

The officers API (`POST /api/admin/officers`) returns:

```json
{
  "success": true,
  "emailDelivered": true,
  "emailMode": "live",
  "officer": { "uid": "...", "loginId": "...", ... }
}
```

If email delivery fails **after** account creation:

```json
{
  "success": true,
  "emailDelivered": false,
  "emailMode": "live",
  "emailError": "SMTP authentication failed",
  "notice": "Account created but credential email delivery failed. Use Retry."
}
```

The Admin UI should surface a **Retry Credential Email** action in this case.
Account re-creation is not required.

---

## 5. Mock / Fallback Mode

When `GMAIL_USER` or `GMAIL_APP_PASSWORD` is absent (e.g., during local
development without credentials), the mailer enters **mock mode**:

- Credential email structure is logged to server console stdout.
- Sensitive fields (passwords) are not logged.
- The API returns `emailMode: "mock"` in the response.

---

## 6. Email Audit

Every send attempt writes an audit record to the server console:

```
[e-Bhoomi EmailAudit] type=OfficerAccountCreated recipient=... result=DELIVERED ts=...
```

> [!CAUTION]
> The audit record **never** contains:
> - `GMAIL_APP_PASSWORD`
> - Officer's temporary password
> - OTP codes
> - Authentication tokens

Future enhancement: write audit records to Firestore `emailAuditLogs` collection.

---

## 7. Available Email Templates

| Template | Trigger |
|---|---|
| `OfficerAccountCreated` | Admin provisions new officer |
| `OfficerTransferred` | Officer jurisdiction reassignment |
| `AccountSuspended` | Officer account suspended |

Future templates (not yet active):
- `TemporaryPasswordNotice`
- `PasswordChanged`
- `NotificationPublished`
- `CorrectionAssigned`

---

## 8. Security Summary

| Rule | Status |
|---|---|
| GMAIL_APP_PASSWORD never in source code | ✅ |
| GMAIL_APP_PASSWORD never in .env.example (real value) | ✅ |
| .env.local excluded from Git | ✅ |
| NEXT_PUBLIC_GMAIL_* variables forbidden | ✅ |
| Email sending server-side only | ✅ |
| Temporary passwords not stored in Firestore | ✅ |
| Temporary passwords not stored in audit logs | ✅ |
| Mock mode on missing credentials | ✅ |
| Graceful failure on SMTP error | ✅ |
