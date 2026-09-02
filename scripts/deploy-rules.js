const admin = require('firebase-admin');
const fs = require('fs');

// Load environment variables from .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const splitIndex = line.indexOf('=');
    const key = line.slice(0, splitIndex).trim();
    let val = line.slice(splitIndex + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
});

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (privateKey && privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });
}

async function deployRules() {
  try {
    const rulesContent = fs.readFileSync('firestore.rules', 'utf8').replace(/\r\n/g, '\n');
    
    console.log('Creating ruleset...');
    const ruleset = await admin.securityRules().createRuleset({
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rulesContent
          }
        ]
      }
    });

    console.log(`Ruleset created: ${ruleset.name}`);
    console.log('Releasing ruleset to Firestore...');
    
    await admin.securityRules().releaseFirestoreRuleset(ruleset.name);
    console.log('Successfully deployed firestore.rules to production!');
  } catch (error) {
    console.error('Failed to deploy rules:', error);
  }
}

deployRules();
