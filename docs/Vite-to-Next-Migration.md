# Vite to Next.js App Router Migration Audit & Strategy

## Executive Summary
This document records the comprehensive migration of the e-Bhoomi National Land Records Modernization & Digitization System from Vite + React SPA to Next.js 15 (App Router) + React + TypeScript + Node.js runtime.

The migration resets the frontend foundation, eliminates Vite dependencies and layout-breaking container styles, and establishes a clean, role-based App Router structure with nested layouts and strict type safety.

---

## 1. Existing Architecture Inventory

| Component Category | Vite Implementation | Next.js Target Architecture |
|---|---|---|
| **Build & Dev Server** | Vite 6 (`npx vite`, `vite.config.js`) | Next.js 15 (`next dev`, `next build`, `next.config.mjs`) |
| **Routing** | Client-side `react-router-dom` (`BrowserRouter`, `<Routes>`, `<Route>`) | Next.js App Router file-system routing (`app/` directory) |
| **Language** | JavaScript (`.jsx`, `.js`) | TypeScript (`.tsx`, `.ts`) with strict typing |
| **Layouts** | Monolithic `App.jsx` with manually nested routes & duplicated headers | Next.js App Router nested layouts (`layout.tsx`) per role |
| **Styling** | `src/styles/index.css` corrupted by Vite `#root` limits in `src/index.css` & `src/App.css` | Consolidated Government of India Design System in `app/globals.css` (Vite `#root` files deleted) |
| **Assets** | Public SVGs in `/public/assets` | Preserved vector SVGs in `/public/assets` served directly by Next.js static asset handler |
| **Services** | `src/services/*.js` | Type-safe service boundary modules in `src/services/*.ts` |

---

## 2. Inventory of Files & Components

### 2.1 Preserved Assets & Data
- `/public/assets/department-of-land-resources.svg`
- `/public/assets/ministry-of-rural-development.svg`
- `/public/assets/e-bhoomi-logo.svg`
- `src/data/administrative/*.json` (States, Districts, Revenue Divisions, Subdistricts, Villages master metadata)

### 2.2 Preserved Core UI Design System
- `src/styles/index.css` (1530+ lines of Government of India design tokens, navy palette `--goi-navy`, typography, buttons, tables, steppers, workspace panels, and sticky action bars).

### 2.3 Files to be Removed (Vite Cleanup)
- `vite.config.js`
- `index.html` (Vite single page entry point)
- `src/index.css` (Contained layout-breaking `#root { width: 1126px; }` styles)
- `src/App.css` (Contained Vite default template CSS)
- `src/main.jsx` (Vite DOM mount script)
- `src/App.jsx` (React Router SPA route manifest)
- Vite dependencies in `package.json` (`vite`, `@vitejs/plugin-react`, `react-router-dom`)

---

## 3. Target App Router Structure

```
app/
├── globals.css
├── layout.tsx
├── page.tsx
├── not-found.tsx
├── login/
│   └── page.tsx
├── auth/
│   └── change-password/
│       └── page.tsx
├── officer/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── digitization/
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── review/
│   │       └── page.tsx
│   ├── records/
│   │   └── page.tsx
│   ├── review/
│   │   └── page.tsx
│   ├── field-verification/
│   │   └── page.tsx
│   ├── corrections/
│   │   └── page.tsx
│   └── submitted/
│       └── page.tsx
├── mro/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── field-officers/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── villages/
│   │   └── page.tsx
│   ├── approvals/
│   │   └── page.tsx
│   ├── corrections/
│   │   └── page.tsx
│   ├── field-verification/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   └── audit/
│       └── page.tsx
├── rdo/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── mros/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── field-officers/
│   │   └── page.tsx
│   ├── cases/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   └── audit/
│       └── page.tsx
├── district/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── mros/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── field-officers/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── records/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   └── audit/
│       └── page.tsx
├── state/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── districts/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── rdo/
│   │   └── page.tsx
│   ├── mros/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── field-officers/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── administrative-data/
│   │   └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── audit/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
└── admin/
    ├── layout.tsx
    ├── login/
    │   └── page.tsx
    ├── page.tsx
    ├── dashboard/
    │   └── page.tsx
    ├── master-data/
    │   └── page.tsx
    ├── districts/
    │   └── page.tsx
    ├── revenue-divisions/
    │   └── page.tsx
    ├── subdistricts/
    │   └── page.tsx
    ├── villages/
    │   └── page.tsx
    ├── officers/
    │   ├── page.tsx
    │   ├── create/
    │   │   └── page.tsx
    │   └── [id]/
    │       └── page.tsx
    ├── jurisdictions/
    │   └── page.tsx
    ├── roles/
    │   └── page.tsx
    ├── notifications/
    │   └── page.tsx
    ├── audit/
    │   └── page.tsx
    ├── security/
    │   └── page.tsx
    └── settings/
        └── page.tsx
```

---

## 4. Key Migration Risks & Mitigation Plan

1. **Routing Incompatibilities (`react-router-dom` vs Next.js App Router)**:
   - *Risk*: Usage of `useNavigate()`, `<Link to="...">`, or `useParams()` will break under Next.js.
   - *Mitigation*: Replace with `next/navigation` (`useRouter`, `usePathname`, `useParams`) and `next/link` (`<Link href="...">`).
2. **Client vs Server Components**:
   - *Risk*: Next.js App Router defaults to Server Components. Components using state (`useState`, `useEffect`) or events will crash if not marked `'use client'`.
   - *Mitigation*: Add `'use client'` directive to interactive UI components (sidebars, forms, tabs, steppers, modals).
3. **UI/Layout Regressions**:
   - *Risk*: Porting components without resolving the `#root` CSS restriction will leave layout regressions.
   - *Mitigation*: Root layout `app/layout.tsx` will wrap children in full-bleed viewport layout without `#root` max-width constraints.
4. **SVG Asset Loading**:
   - *Risk*: `<img>` tags referencing SVGs in `/public/assets` failing or rasterizing.
   - *Mitigation*: Serve SVGs standardly from `/public/assets/` using native `<img>` or `next/image` with unoptimized SVG handling. Preserve native vector format.

---

## 5. Validation Protocol
- Run `npm run lint` and `npm run build` to confirm zero build/type errors.
- Start server using `npm run dev` and verify `http://localhost:3000`.
- Browser test all routes across public, field officer, MRO, RDO, district, state, and system admin workspaces.
