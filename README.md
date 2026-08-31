# e-Bhoomi — AI-Assisted Land-Record Digitization & Validation Platform

**Project**: e-Bhoomi  
**Event**: Smart India Hackathon (SIH) Prototype  
**Current Stage**: Public Location-Based Land Record Search Redesign & Backend Integration Ready  
**Team**: DigitalX  
**Team Members**: Rahul Chakradhar · Bharth Yuvaraj · Karthika · Spandana · Ashad · Mohaniesh  

---

## 📌 Geographic, Language & Public Discovery Scope

- **Active Geographic Scope**: **Andhra Pradesh — Kurnool District** (LGD District Code: `545`, LGD State Code: `28`)
- **Active Languages**: **Telugu** (`te`) + **English** (`en`)
- **Public Land Record Discovery Flow**: 
  1. **Location**: State → District → Revenue Division → Mandal → Village / Ward / Town
  2. **Survey Number**: Type-ahead searchable survey selection
  3. **Matching Records**: Digitized record summary table & detailed inspection view
- **No-Aadhaar & No-Mobile OTP Homepage Search**: Public discovery queries authorized revenue records directly without requiring Aadhaar numbers or mobile SMS verification steps on the homepage.
- **Future Extensibility Scope**:
  - Multi-state expansion via centralized state configuration (`APP_CONFIG`)
  - Additional Indic languages
  - Additional land-record document families

---

## 🧭 Zero Manual URL Editing & Contextual Header Architecture

- **Contextual Application Sub-Titles**:
  - `FIELD / VILLAGE REVENUE PORTAL` (`/officer/*`)
  - `MANDAL REVENUE ADMINISTRATION` (`/mro/*`)
  - `REVENUE DIVISION ADMINISTRATION` (`/rdo/*`)
  - `DISTRICT LAND RECORD ADMINISTRATION` (`/district/*`)
  - `STATE LAND RECORD ADMINISTRATION` (`/state/*`)
  - `SYSTEM ADMINISTRATION` (`/admin/*`)
- **Centralized System Admin Hub (`/admin/*`)**: Unified application shell providing single-click access to Dashboard, Master Data, Districts, Divisions, Mandals, Villages, Officer Directory, Create Officer, Roles, Notifications, Audit, Security, and Settings.
- **Dynamic Breadcrumbs (`Breadcrumbs.tsx`)**: Interactive breadcrumbs for hierarchical navigation (`State > Districts > Kurnool > Mandals > Kurnool Urban > VRO Gargeyapuram`).
- **Read-Only Subordinate Workspace Viewing (`SubordinateWorkspaceViewer.tsx`)**: Superior officers view subordinate workspaces in explicit `READ ONLY` mode without account impersonation.

---

## 📄 Architecture & Audit Documentation

- [Backend Integration Architecture](docs/Backend-Architecture.md)
- [Firebase Console & Setup Guide](docs/Firebase-Console-Setup.md)
- [Nodemailer Email Service Setup Guide](docs/Email-Service-Setup.md)
- [Administrative Bootstrap Guide](docs/Admin-Bootstrap.md)
- [Firebase Integration Architecture (Client)](docs/Firebase-Architecture.md)
- [Firebase Console & Setup Guide (Client)](docs/Firebase-Setup.md)
- [Navigation Architecture](docs/Navigation-Architecture.md)
- [Officer Application Architecture](docs/Officer-Application-Architecture.md)
- [Hierarchical Visibility & Delegation](docs/Hierarchical-Visibility-and-Delegation.md)
- [Admin Security Isolation & 2FA](docs/Admin-Security.md)
- [Authorization Architecture](docs/Authorization-Architecture.md)
- [Administrative Data Architecture](docs/Administrative-Data-Architecture.md)
- [UI Audit Report](docs/UI-Audit.md)
- [UI Walkthrough & Specs](docs/UI-Walkthrough.md)

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### Steps

1. **Navigate to workspace**:
   ```bash
   cd "r:\e-Bhoomi"
   ```

2. **Generate Kurnool Authoritative Seed Data**:
   ```bash
   node scripts/import-kurnool-master-data.js
   ```

3. **Seed Firestore Database**:
   ```bash
   node scripts/seed-master-data.js
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build Production Bundle**:
   ```bash
   npm run build
   ```
