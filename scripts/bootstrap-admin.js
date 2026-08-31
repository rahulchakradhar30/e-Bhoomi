/**
 * e-Bhoomi — Bootstrap First System Admin Account (Direct Admin SDK)
 *
 * This script provisions the SYSTEM_ADMIN account directly using
 * the Firebase Admin SDK — no HTTP API call needed.
 *
 * Usage: node scripts/bootstrap-admin.js
 */

const path = require('path');
const fs = require('fs');

// ─── Load .env.local ─────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found at', envPath);
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

// ─── Validate env ────────────────────────────────────────────────────────────
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'BOOTSTRAP_ADMIN_EMAIL',
  'BOOTSTRAP_ADMIN_PASSWORD',
];
for (const v of requiredVars) {
  if (!process.env[v]) {
    console.error(`❌ Missing env var: ${v}`);
    process.exit(1);
  }
}

const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

// ─── Firebase Admin SDK (direct — no HTTP needed) ────────────────────────────
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Initialise Admin SDK
const adminApp = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
}, 'bootstrap');

const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);

// Client SDK (to create the user account)
const clientApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}, 'bootstrap-client');
const clientAuth = getAuth(clientApp);

async function run() {
  console.log('\n🚀 e-Bhoomi Bootstrap Admin (Direct SDK)');
  console.log('==========================================');
  console.log(`📧 Email   : ${bootstrapEmail}`);
  console.log(`🔑 Project : ${process.env.FIREBASE_ADMIN_PROJECT_ID}`);
  console.log('');

  // ─── Step 1: Create or sign in via Client SDK ───────────────────────────
  let uid;
  try {
    console.log('🔐 Creating Firebase Auth user...');
    const cred = await createUserWithEmailAndPassword(clientAuth, bootstrapEmail, bootstrapPassword);
    uid = cred.user.uid;
    console.log('✅ Firebase Auth user created:', uid);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('ℹ️  User already exists. Signing in...');
      const cred = await signInWithEmailAndPassword(clientAuth, bootstrapEmail, bootstrapPassword);
      uid = cred.user.uid;
      console.log('✅ Signed in. UID:', uid);
    } else {
      console.error('❌ Firebase Auth error:', err.message);
      process.exit(1);
    }
  }

  // ─── Step 2: Set SYSTEM_ADMIN custom claims via Admin SDK ───────────────
  console.log('\n🛡  Setting SYSTEM_ADMIN custom claims...');
  await adminAuth.setCustomUserClaims(uid, {
    role: 'SYSTEM_ADMIN',
    admin: true,
  });
  console.log('✅ Custom claims set: role=SYSTEM_ADMIN, admin=true');

  // ─── Step 3: Write Firestore profiles ───────────────────────────────────
  console.log('\n💾 Writing Firestore profiles...');
  const now = new Date().toISOString();
  const batch = adminDb.batch();

  batch.set(adminDb.collection('users').doc(uid), {
    uid,
    email: bootstrapEmail,
    mobile: null,
    role: 'SYSTEM_ADMIN',
    accountStatus: 'ACTIVE',
    mustChangePassword: false,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }, { merge: true });

  batch.set(adminDb.collection('admins').doc(uid), {
    uid,
    email: bootstrapEmail,
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }, { merge: true });

  const auditRef = adminDb.collection('auditLogs').doc();
  batch.set(auditRef, {
    auditId: auditRef.id,
    actorUid: uid,
    actorRole: 'SYSTEM_ADMIN',
    action: 'SYSTEM_BOOTSTRAPPED',
    targetType: 'SYSTEM',
    targetId: 'e-bhoomi-system',
    oldValueSummary: 'N/A',
    newValueSummary: 'System admin bootstrap privileges granted via direct Admin SDK script.',
    reason: 'Initial system administrative provisioning.',
    timestamp: now,
    jurisdiction: 'NATION',
  });

  await batch.commit();
  console.log('✅ Firestore profiles written (users, admins, auditLogs)');

  console.log('\n✅ BOOTSTRAP COMPLETE');
  console.log('===========================================');
  console.log(`Role     : SYSTEM_ADMIN`);
  console.log(`Email    : ${bootstrapEmail}`);
  console.log(`UID      : ${uid}`);
  console.log(`Login at : http://localhost:3000/admin/login`);
  console.log('===========================================\n');

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
