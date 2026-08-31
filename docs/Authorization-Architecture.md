# e-Bhoomi Authorization & Hierarchical Access Architecture

## Overview
e-Bhoomi implements Role-Based Access Control (RBAC) anchored in official administrative jurisdictions (State, District, Revenue Division, Mandal, Village).
**SIH MVP Active Scope**: Andhra Pradesh — Kurnool District.
*Architecture is designed for future multi-state expansion.*

---

## 1. Role Hierarchy & Workspaces

```
STATE_ADMIN (State Land Records Authority - AP)
    │
    ├── DISTRICT_COLLECTOR (District Land Record Administration - Kurnool)
    │     │
    │     ├── RDO_OFFICER (Revenue Division Administration - Kurnool / Adoni / Pattikonda)
    │     │     │
    │     │     └── TAHSILDAR_MRO (Mandal Revenue Administration)
    │     │           │
    │     │           └── FIELD_VRO (Village Revenue Officer)
```

---

## 2. Rule of Hierarchical Inspection (VIEW ≠ ACT)
- Superior officers can view subordinate workspaces for statutory inspection.
- The viewer remains logged in with their own authenticated credentials.
- Subordinate action buttons are disabled during inspection mode via `ReadOnlyBanner.tsx` and `SubordinateWorkspaceViewer.tsx`.

---

## 3. Special-Case Delegation
- Statutory delegation allows a superior officer to perform a delegated action on a specific case with explicit government order reference (`GO-MS-142/REV-2026`).
- Managed UI-side via `DelegationModal.tsx`.
