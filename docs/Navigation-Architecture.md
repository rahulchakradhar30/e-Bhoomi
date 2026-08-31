# e-Bhoomi Navigation Architecture (Next.js App Router)

## Overview
All navigation in e-Bhoomi is application-driven through App Router links (`next/link`), top contextual headers, role-specific sidebars, steppers, tabs, breadcrumbs, and cards. Manual URL editing is never required.
**SIH MVP Active Scope**: Andhra Pradesh — Kurnool District.

---

## Role Portal Navigations

### 1. Public Portal (`/`)
- Public Homepage: Hero Search (AP Kurnool Focus), Quick Service Links
- Public Sign In: `/login`
- System Admin Sign In: `/admin/login`

### 2. Field / Village Revenue Officer Portal (`/officer/*`)
- Header: `FIELD / VILLAGE REVENUE PORTAL`
- Workspace Scope: `VILLAGE REVENUE OFFICER WORKSPACE` (Kurnool District)
- Sidebar Navigation:
  - Dashboard: `/officer/dashboard`
  - New Digitization: `/officer/digitization/new`
  - AI Review Queue: `/officer/digitization/review`
  - My Records: `/officer/records`
  - Pending Review: `/officer/review`
  - Field Verification: `/officer/field-verification`
  - Corrections: `/officer/corrections`
  - Submitted Records: `/officer/submitted`

### 3. Mandal Revenue Administration Portal (`/mro/*`)
- Header: `MANDAL REVENUE ADMINISTRATION`
- Workspace Scope: `TAHSILDAR / MANDAL REVENUE OFFICER WORKSPACE` (Kurnool District Mandals)
- Sidebar Navigation:
  - Dashboard: `/mro/dashboard`
  - Field Officers: `/mro/field-officers`
  - Subordinate Inspection: `/mro/field-officers/[id]` (Read-Only)
  - Villages: `/mro/villages`
  - Pending Approvals: `/mro/approvals`
  - Corrections: `/mro/corrections`
  - Field Verification: `/mro/field-verification`
  - Reports: `/mro/reports`
  - Audit Log: `/mro/audit`

### 4. Revenue Division Administration Portal (`/rdo/*`)
- Header: `REVENUE DIVISION ADMINISTRATION`
- Workspace Scope: `REVENUE DIVISIONAL OFFICER WORKSPACE` (Kurnool Revenue Divisions)
- Sidebar Navigation:
  - Dashboard: `/rdo/dashboard`
  - Tahsildars / MROs: `/rdo/mros`
  - Subordinate Inspection: `/rdo/mros/[id]` (Read-Only)
  - Field Officers: `/rdo/field-officers`
  - Division Cases: `/rdo/cases`
  - Reports: `/rdo/reports`
  - Audit Log: `/rdo/audit`

### 5. District Land Record Administration Portal (`/district/*`)
- Header: `DISTRICT LAND RECORD ADMINISTRATION`
- Workspace Scope: `DISTRICT COLLECTOR / DEPUTY COMMISSIONER WORKSPACE` (Kurnool District)
- Sidebar Navigation:
  - Dashboard: `/district/dashboard`
  - MRO / Tahsildars: `/district/mros`
  - Subordinate MRO Inspection: `/district/mros/[id]` (Read-Only)
  - Field Officers: `/district/field-officers`
  - Subordinate VRO Inspection: `/district/field-officers/[id]` (Read-Only)
  - District Records: `/district/records`
  - Reports: `/district/reports`
  - Audit Log: `/district/audit`

### 6. State Land Record Administration Portal (`/state/*`)
- Header: `STATE LAND RECORD ADMINISTRATION`
- Workspace Scope: `STATE LAND RECORDS AUTHORITY WORKSPACE` (Andhra Pradesh)
- Sidebar Navigation:
  - Dashboard: `/state/dashboard`
  - Districts: `/state/districts`
  - Subordinate District Inspection: `/state/districts/[id]` (Read-Only)
  - Revenue Divisions: `/state/rdo`
  - MRO / Tahsildars: `/state/mros`
  - Subordinate MRO Inspection: `/state/mros/[id]` (Read-Only)
  - Field Officers: `/state/field-officers`
  - Subordinate VRO Inspection: `/state/field-officers/[id]` (Read-Only)
  - Administrative Data: `/state/administrative-data`
  - Notifications: `/state/notifications`
  - Reports: `/state/reports`
  - Audit Log: `/state/audit`
  - Settings: `/state/settings`

### 7. System Administration Portal (`/admin/*`)
- Header: `SYSTEM ADMINISTRATION`
- Workspace Scope: `HIGH-SECURITY SYSTEM CONSOLE`
- Sidebar Navigation:
  - Dashboard: `/admin/dashboard`
  - Master Data: `/admin/master-data`
  - Districts: `/admin/districts`
  - Revenue Divisions: `/admin/revenue-divisions`
  - Mandals: `/admin/subdistricts`
  - Villages: `/admin/villages`
  - Officer Directory: `/admin/officers`
  - Provision Officer: `/admin/officers/create`
  - Officer Details: `/admin/officers/[id]`
  - Jurisdictions: `/admin/jurisdictions`
  - Roles & Permissions: `/admin/roles`
  - Notifications: `/admin/notifications`
  - Audit Trail: `/admin/audit`
  - Security: `/admin/security`
  - Settings: `/admin/settings`
