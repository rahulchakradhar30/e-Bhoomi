const { GoogleAuth } = require('google-auth-library');
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

async function deploy() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const rules = fs.readFileSync('firestore.rules', 'utf8').replace(/\r\n/g, '\n');

  console.log('Creating ruleset via REST...');
  const res = await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    method: 'POST',
    data: {
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rules
          }
        ]
      }
    }
  });

  const rulesetName = res.data.name;
  console.log(`Created ruleset: ${rulesetName}`);

  console.log('Releasing to firestore.rules...');
  await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    method: 'PATCH',
    data: {
      release: {
        name: `projects/${projectId}/releases/cloud.firestore`,
        rulesetName: rulesetName
      }
    }
  });

  console.log('Success! Firestore rules deployed.');
}

deploy().catch(console.error);
