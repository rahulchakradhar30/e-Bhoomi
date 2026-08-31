# e-Bhoomi — Administrative Bootstrap Guide

This guide explains the secure administrative bootstrap process for provisioning the initial `SYSTEM_ADMIN` role.

---

## 1. Concept

During initial project deployment, the database is empty and there are no administrators. To establish the baseline administrative authority:
1. Configure `BOOTSTRAP_ADMIN_EMAIL` in `.env.local` to match your administrative Google/Email account.
2. Sign in to the application as a public citizen using that email address.
3. Access the `/api/auth/bootstrap` POST endpoint from the console or during initialization.
4. The server validates your authenticated session, maps your email to `BOOTSTRAP_ADMIN_EMAIL`, sets custom claims, and initializes baseline profile documents.

```
[Citizen Sign-in] ──> [Call /api/auth/bootstrap] ──> [Grant SYSTEM_ADMIN]
```

---

## 2. Server Configuration

Add the bootstrap variable to your server-side environment (`.env.local`):

```env
# Administrative bootstrap target email
BOOTSTRAP_ADMIN_EMAIL=admin@e-bhoomi.gov.in
```

---

## 3. Invoking the Bootstrap API

To invoke the bootstrap API once authenticated:

1. Copy the authenticated ID Token from `auth.currentUser.getIdToken()`.
2. Make a POST request using `curl` or Postman:

```bash
curl -X POST http://localhost:3000/api/auth/bootstrap \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json"
```

3. Response:
```json
{
  "success": true,
  "message": "System bootstrap successful. SYSTEM_ADMIN claims and profiles provisioned successfully."
}
```

Once bootstrapped, reload your credentials token to propagate the custom claims, and access the System Admin Panel at `/admin`.
