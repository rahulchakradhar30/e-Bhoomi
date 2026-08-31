# e-Bhoomi — Firebase Console & Environment Setup Guide

This guide provides step-by-step instructions for completing the out-of-code Firebase Console configuration, environment setup, and local emulator execution.

---

## 1. Firebase Console Setup Checklist

### Step 1: Project & Web App Verification
1. Navigate to [Firebase Console](https://console.firebase.google.com/).
2. Select project **e-bhoomi** (`e-bhoomi`).
3. Verify that Web App `1:585423835169:web:3fa0c44b8dd47e3738d360` is registered.

### Step 2: Authentication Configuration
1. Go to **Build -> Authentication -> Sign-in method**.
2. **Email/Password**: Click Enable and Save.
3. **Google**: Click Enable, select support email, and Save.
4. **Phone**:
   - Click Enable.
   - Under **Authorized domains**, ensure `localhost` and your production domain are listed.
   - (Optional for development) Add testing phone numbers and SMS verification codes under **Phone numbers for testing** (e.g., `+91 9999999999` with code `123456`).

### Step 3: Cloud Firestore Setup
1. Go to **Build -> Firestore Database**.
2. Click **Create Database**.
3. Select location (recommended: `asia-south1` for India / Andhra Pradesh proximity).
4. Choose **Start in production mode** (rules will be deployed via CLI from `firestore.rules`).

### Step 4: Firebase Storage Setup
1. Go to **Build -> Storage**.
2. Click **Get Started**.
3. Select standard storage bucket (`e-bhoomi.firebasestorage.app`).
4. Choose location matching Firestore (`asia-south1`).

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Populate `.env.local` with the client keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=e-bhoomi.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=e-bhoomi
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=e-bhoomi.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=585423835169
NEXT_PUBLIC_FIREBASE_APP_ID=1:585423835169:web:3fa0c44b8dd47e3738d360
```

> [!WARNING]
> Never commit `.env.local` to source control. Ensure `.gitignore` ignores all `.env*` files except `.env.example`.

---

## 3. Local Emulator Suite Execution

For offline development and unit testing without affecting live Firebase production data, use the Firebase Local Emulator Suite.

### Prerequisites
- Node.js 18+
- Java Development Kit (JDK) 11+ (required for Firebase Emulators)
- Firebase CLI (`npm install -g firebase-tools`)

### Starting Emulators
Run the emulator command in root directory:

```bash
firebase emulators:start
```

The Emulator Suite UI will be accessible at: `http://localhost:4000`
- Auth Emulator: `localhost:9099`
- Firestore Emulator: `localhost:8080`
- Storage Emulator: `localhost:9199`

---

## 4. Deploying Security Rules

Deploy security rules to your live Firebase project using Firebase CLI:

```bash
firebase login
firebase use e-bhoomi
firebase deploy --only firestore:rules,storage:rules
```
