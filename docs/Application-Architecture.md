# e-Bhoomi Modern Next.js App Router Architecture

## Executive Summary
e-Bhoomi uses Next.js 15 App Router architecture with React, TypeScript, and Node.js runtime.
**SIH MVP Scope**: Andhra Pradesh — Kurnool District Focus.
*Architecture is designed for future multi-state expansion.*

---

## 1. Directory Structure

```
app/
├── globals.css                       # Consolidated Government of India Design System
├── layout.tsx                        # Root Portal Layout
├── not-found.tsx                     # e-Bhoomi 404 Page
├── page.tsx                           # Public Homepage
├── login/page.tsx                    # Officer Public Sign In
├── auth/change-password/page.tsx     # Credential Lifecycle Page
├── officer/                          # Field / Village Revenue Officer Portal
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/page.tsx
│   ├── digitization/new/page.tsx
│   ├── digitization/review/page.tsx
│   ├── records/page.tsx
│   ├── review/page.tsx
│   ├── field-verification/page.tsx
│   ├── corrections/page.tsx
│   └── submitted/page.tsx
├── mro/                              # Mandal Revenue Administration Portal
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/page.tsx
│   ├── field-officers/page.tsx
│   ├── field-officers/[id]/page.tsx
│   ├── villages/page.tsx
│   ├── approvals/page.tsx
│   ├── corrections/page.tsx
│   ├── field-verification/page.tsx
│   ├── reports/page.tsx
│   └── audit/page.tsx
├── rdo/                              # Revenue Division Administration Portal
│   ├── layout.tsx
│   └── ...
├── district/                         # District Land Record Administration Portal
│   ├── layout.tsx
│   └── ...
├── state/                            # State Land Record Administration Portal
│   ├── layout.tsx
│   └── ...
└── admin/                            # High-Security System Administration Portal
    ├── layout.tsx
    ├── login/page.tsx
    └── ...
```

---

## 2. Core Architectural Principles
1. **App Router File-System Routing**: Routing is entirely application-driven via Next.js `next/link` and `next/navigation`.
2. **Nested Application Shell Layouts**: Each revenue role has its dedicated layout (`app/officer/layout.tsx`, `app/mro/layout.tsx`, etc.).
3. **Contextual Role Headers**: Context-specific title strips (`FIELD / VILLAGE REVENUE PORTAL`, `MANDAL REVENUE ADMINISTRATION`, etc.).
4. **Zero-Demo-Data**: No mock records, operational statistics, or fake officer accounts exist in the codebase.
5. **Full Vector SVG Branding**: Preserved vector SVGs (`department-of-land-resources.svg`, `ministry-of-rural-development.svg`, `e-bhoomi-logo.svg`).
6. **Backend Contract Separation**: Formal TypeScript data contracts (`src/types/backendContracts.ts`) ready for immediate database/API integration.
