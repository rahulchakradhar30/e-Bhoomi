# e-Bhoomi — Firebase Console Setup Checklist

This document details the configuration requirements in the Firebase Console necessary outside of the codebase to support Authentication, Cloud Firestore, Storage, and Custom Claims.

---

## 1. Firebase Authentication Setup
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **e-bhoomi** (`e-bhoomi`).
3. Go to **Build -> Authentication -> Sign-in method**:
   - Enable **Email/Password** provider.
   - Enable **Google** sign-in (for public user convenience where applicable).
   - Enable **Phone** sign-in:
     - Under **Authorized Domains**, add `localhost` and your production deployment domain.
     - Add any testing phone numbers under **Phone numbers for testing** (e.g. `+91 9999999999` with code `123456`) to enable offline testing without hitting SMS quotas.

---

## 2. Cloud Firestore Database Setup
1. Go to **Build -> Firestore Database**.
2. Click **Create Database**.
3. Choose location **asia-south1 (Mumbai)** to minimize latency for Andhra Pradesh revenue officers.
4. Start in **Production mode**.
5. Deploy security rules from [firestore.rules](file:///r:/e-Bhoomi/firestore.rules) using Firebase CLI:
   ```bash
   firebase use e-bhoomi
   firebase deploy --only firestore:rules
   ```

---

## 3. Storage Bucket Setup
1. Go to **Build -> Storage**.
2. Click **Get Started**.
3. Set location to match your Firestore location (**asia-south1**).
4. Deploy rules from [storage.rules](file:///r:/e-Bhoomi/storage.rules) using Firebase CLI:
   ```bash
   firebase deploy --only storage:rules
   ```

---

## 4. Custom Claims Propagation
Custom claims (e.g., `role: 'SYSTEM_ADMIN'`) set by Next.js Server Route Handlers are packaged in the user's ID token.
- **Refresh Claim**: Token credentials do not refresh instantly on the client. To force-update claims immediately after a role update, the client must trigger token force refresh:
  ```typescript
  await auth.currentUser?.getIdToken(true);
  ```
- **Claim validation**: Secure Firestore rules in `firestore.rules` cross-reference the user's role claim against Firestore profiles for secondary validation.
