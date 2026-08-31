# e-Bhoomi — Backend Integration Architecture

## 1. System Overview

This document outlines the backend design, authorization structures, identity mapping, server-only operations, and auditing capabilities provisioned on e-Bhoomi during the Backend Integration phase.

```
                    e-BHOOMI BACKEND
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
  Server APIs                         Firebase Database
 (Next.js Route Handlers)             (Firestore / Storage)
       │                                       │
       ├─ verifyIdToken()                      ├─ Custom Claims
       ├─ Nodemailer Delivery                  ├─ Batched Transactions
       └─ Privilege Auditing                   └─ Security Rules
```

---

## 2. Server API Route Scope & Security Boundaries

Privileged or heavy workflows (e.g. user creation, transfers, secure emails) are kept isolated inside Next.js Server Route Handlers in `app/api/` and initialized with the `firebase-admin` SDK.

### Initial Server Endpoints:
1. **`/api/auth/bootstrap` [POST]**: Safely validates user matching `BOOTSTRAP_ADMIN_EMAIL`, sets `SYSTEM_ADMIN` custom claims, and initializes baseline profile documents.
2. **`/api/admin/officers` [POST]**: Allows System/State admins to provision new revenue officer profiles, assign passwords, and initiate email dispatch.
3. **`/api/admin/transfers` [POST]**: Handles the officer transfer workflow, logging previous jurisdiction details, mapping transfer records, and revising claims.
4. **`/api/state/notifications` [POST]**: Restricts announcements creation to State Administrators and writes notices.
5. **`/api/public/land-records` [GET]**: Resolves survey number query matches while filtering out private owner/Aadhaar references.

---

## 3. Trusted Claim Authorization Hierarchy

Administrative rights and operational visibility follow a strict verified hierarchy:

| User Role | Custom Claims | Jurisdiction Scope | Allowable Operations |
| :--- | :--- | :--- | :--- |
| **SYSTEM_ADMIN** | `role: 'SYSTEM_ADMIN', admin: true` | National | Master data settings, role definition updates, bootstrap. |
| **STATE_ADMIN** | `role: 'STATE_ADMIN'` | State (e.g. AP) | Officer creation, officer transfers, notification publishing. |
| **DISTRICT_ADMIN**| `role: 'DISTRICT_ADMIN'` | District (e.g. Kurnool)| Division supervision, audits, officer directories monitoring. |
| **RDO** | `role: 'RDO'` | Division | approvals escalations review, reports inspection. |
| **MRO** | `role: 'MRO'` | Mandal | approvals execution, correction processing, field verification assignment. |
| **FIELD_OFFICER** | `role: 'FIELD_OFFICER'` | Village | Digitization entry, verification tasks, corrections input. |

---

## 4. Forced Password Lifecycle

To enforce compliance with Government of India Information Security Standards:
1. Provisioned officers are issued a randomly generated strong temporary credentials string.
2. The officer profile is initialized with `mustChangePassword = true` in Firestore.
3. Upon first sign-in, the [RouteGuard](file:///r:/e-Bhoomi/src/components/auth/RouteGuard.tsx) detects `mustChangePassword = true` and forces an absolute redirect to `/auth/change-password`.
4. The officer is blocked from accessing normal portal views until they update their password.

---

## 5. Audit Log Pipeline

Administrative actions commit transaction summaries directly to `auditLogs/` in Firestore.

### Audited Actions:
- Administrative Bootstrap
- Officer account creation
- Officer transfer
- Notification publication

*No passwords or session secrets are ever printed to audit logs or telemetry traces.*
