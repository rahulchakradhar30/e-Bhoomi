/**
 * e-Bhoomi — Deploy Firestore Rules via Firebase Admin REST API
 *
 * Uploads firestore.rules directly using a service account access token.
 * No firebase-tools CLI needed.
 *
 * Usage: node scripts/deploy-firestore-rules.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing FIREBASE_ADMIN_* env vars');
  process.exit(1);
}

const rulesPath = path.resolve(__dirname, '../firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

console.log(`\n🔐 Deploying Firestore rules for project: ${projectId}`);
console.log(`📄 Rules file: ${rulesPath} (${rulesContent.length} bytes)\n`);

const app = admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
}, 'deploy-rules');

async function deployRules() {
  // Get a valid Google OAuth2 access token from the service account
  const token = await app.options.credential.getAccessToken();
  const accessToken = token.access_token;

  const fetch = (await import('node-fetch')).default;

  // Step 1: Create a new ruleset
  const rulesetRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          files: [{ name: 'firestore.rules', content: rulesContent }],
        },
      }),
    }
  );

  const rulesetData = await rulesetRes.json();
  if (!rulesetRes.ok) {
    console.error('❌ Failed to create ruleset:', JSON.stringify(rulesetData, null, 2));
    process.exit(1);
  }

  const rulesetName = rulesetData.name;
  console.log(`✅ Ruleset created: ${rulesetName}`);

  // Step 2: Update the "cloud.firestore" release to point to the new ruleset
  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        release: {
          name: `projects/${projectId}/releases/cloud.firestore`,
          rulesetName,
        },
      }),
    }
  );

  const releaseData = await releaseRes.json();
  if (!releaseRes.ok) {
    // Try PUT if PATCH not supported
    const putRes = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          release: {
            name: `projects/${projectId}/releases/cloud.firestore`,
            rulesetName,
          },
        }),
      }
    );
    const putData = await putRes.json();
    if (!putRes.ok) {
      console.error('❌ Failed to update release:', JSON.stringify(putData, null, 2));
      process.exit(1);
    }
    console.log('✅ Release updated (via PUT)');
  } else {
    console.log('✅ Release updated (via PATCH)');
  }

  console.log('\n✅ FIRESTORE RULES DEPLOYED SUCCESSFULLY');
  console.log('==========================================');
  console.log(`Project  : ${projectId}`);
  console.log(`Ruleset  : ${rulesetName}`);
  console.log('Rules are live — no CLI needed.');
  console.log('==========================================\n');

  process.exit(0);
}

deployRules().catch((err) => {
  console.error('❌ Deploy failed:', err);
  process.exit(1);
});
