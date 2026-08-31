# e-Bhoomi Hierarchical Subordinate Visibility & Special-Case Delegation Architecture

## 1. Core Visibility Principle: VIEW ≠ ACT

A fundamental architectural rule of e-Bhoomi is:
> **Higher officers can view subordinate workspaces, but CANNOT automatically perform subordinate actions.**

When a Tahsildar (MRO), RDO, District Collector, or State Administrator inspects a subordinate officer's workspace (e.g. `/mro/field-officers/:id`), the workspace is loaded inside the `SubordinateWorkspaceViewer` component in **`READ ONLY MODE`**.

```
HIGHER OFFICER
    │
    ▼
Opens Subordinate Workspace (/mro/field-officers/:id)
    │
    ▼
SubordinateWorkspaceViewer Component (VIEWING SUBORDINATE WORKSPACE — READ ONLY)
    │
    ▼
Action Controls Omitted or Disabled
```

---

## 2. Prohibition Against Account Impersonation

The platform strictly forbids "Login as VRO" or account impersonation:
- The authenticated identity of the higher officer is preserved at all times.
- Browsing a subordinate's queue does not change the logged-in session, user tokens, or user role.
- All actions remain attributed to the actual logged-in user in permanent audit logs.

---

## 3. Special-Case Delegated Action Model (`DelegationModal.jsx`)

For exceptional legal or emergency interventions, a controlled **Special-Case Delegation** workflow exists:

1. **Initiation**: Higher officer opens a specific case within a subordinate's workspace.
2. **Delegation Request**: Officer clicks `[ Special-Case Delegation Request ]` to launch `DelegationModal`.
3. **Statutory Justification**: Officer specifies the target case, requested delegated action type, formal reason, and checks authorization confirmation.
4. **Active Banner**: Upon activation, a prominent `SPECIAL-CASE DELEGATION ACTIVE` banner displays:
   - **Acting User**: [Logged-in Higher Officer Account]
   - **Original Responsible Officer**: [Subordinate Account]
   - **Target Case**: [Case ID]
   - **Reason**: [Statutory Justification]
   - **Audit Reference**: [Generated Reference ID]
5. **Audit Logging**: Every delegated action generates an immutable audit record logging actor, target, timestamp, reason, and authorization reference.
