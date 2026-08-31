# e-Bhoomi Hierarchical Officer Portal & Application Architecture

## 1. Overview

The **e-Bhoomi** platform separates internal officer experiences by administrative role. Rather than rendering one generic dashboard with conditionally hidden buttons, each government officer level receives a dedicated, task-oriented application shell and contextual header.

---

## 2. Contextual Application Headers & Role Navigation

All portals retain shared Government of India header logos (`department-of-land-resources.svg`, `ministry-of-rural-development.svg`, `e-bhoomi-logo.svg`) while displaying a role-specific contextual application sub-header:

- **Field / Village Officer**: `FIELD / VILLAGE REVENUE PORTAL` (`/officer/*`)
- **MRO / Tahsildar**: `MANDAL REVENUE ADMINISTRATION` (`/mro/*`)
- **Revenue Divisional Officer (RDO)**: `REVENUE DIVISION ADMINISTRATION` (`/rdo/*`)
- **District Collector**: `DISTRICT LAND RECORD ADMINISTRATION` (`/district/*`)
- **State Administrator**: `STATE LAND RECORD ADMINISTRATION` (`/state/*`)
- **System Administrator**: `SYSTEM ADMINISTRATION` (`/admin/*`)

---

## 3. Centralized System Admin Hub (`/admin/*`)

System Administrators manage all administrative modules from one unified shell:
- `/admin/dashboard` — System overview
- `/admin/master-data` — LGD geographic master data browser
- `/admin/districts`, `/admin/revenue-divisions`, `/admin/subdistricts`, `/admin/villages` — Geographical entity hubs
- `/admin/officers` & `/admin/officers/create` — Officer directory & account creation
- `/admin/officers/:id` — Officer detail workspace featuring `[ VIEW WORKSPACE (READ ONLY) ]` button
- `/admin/roles`, `/admin/notifications`, `/admin/audit`, `/admin/security`, `/admin/settings` — Administrative control pages

---

## 4. Zero Manual URL Editing Guarantee

Users navigate entirely through UI sidebars, top navigation bars, contextual sub-headers, interactive breadcrumbs, and detail link buttons without needing to type or modify browser URLs manually.
