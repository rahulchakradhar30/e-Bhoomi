const admin = require('firebase-admin');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const splitIndex = line.indexOf('=');
    const key = line.slice(0, splitIndex).trim();
    let val = line.slice(splitIndex + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[key] = val;
  }
});

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (privateKey && privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  })
});

admin.securityRules().releaseFirestoreRuleset('c15b04b2-cf2a-4b0e-84e0-68a320799123')
  .then(() => console.log('Successfully released ruleset!'))
  .catch(console.error);
