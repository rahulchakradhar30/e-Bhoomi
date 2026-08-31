# e-Bhoomi Administrator Security & Access Isolation Architecture

## 1. Overview

The **e-Bhoomi** system enforces strict administrative isolation to prevent privilege escalation, unauthorized account creation, and casual modification of land records.

---

## 2. Protected Administrator Access Isolation

- **Separate Authentication Route**: Administrator authentication occurs exclusively via `/admin/login`, completely isolated from ordinary revenue officer sign-in (`/login`).
- **No Public Registration**: Public self-registration for administrative accounts (`Register as Admin`) is disabled. Administrator account creation is restricted to controlled deployment configuration or authorized super-administrator provisioning (`/admin/officers/create`).

---

## 3. Two-Factor Authentication (2FA) Architecture

All administrator logins require two-factor authentication (2FA):

1. **Step 1**: Administrator User ID + Primary Password Verification.
2. **Step 2**: Time-based One-Time Password (TOTP) / Security Token verification.
3. **Session Issuance**: Administrative session tokens are granted only upon successful completion of both authentication steps.

---

## 4. Password Policy & Credential Lifecycle

- **No Universal Default Passwords**: Pre-configured passwords (e.g. `Admin@123`) are prohibited.
- **Temporary Credential Issuance**: When an administrator provisions a subordinate account, temporary credentials are generated.
- **Mandatory Password Reset**: Accounts are initialized with `mustChangePassword = true`. The user is automatically redirected to `/auth/change-password` upon initial login.

---

## 5. Separation of System Administration & Land Record Editing

- **System Administration Scope**: Managing master data (`/admin/master-data`), assigning district/divisional authorities, and configuring role permissions.
- **Land Record Authority Scope**: Administrators do not possess casual direct-editing privileges over approved land records. Land record modifications require explicit legal correction workflows.
