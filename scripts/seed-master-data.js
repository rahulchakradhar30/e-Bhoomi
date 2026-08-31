/**
 * e-Bhoomi Firestore Master Data Seeder Script
 * Seeds authoritative AP -> Kurnool administrative hierarchy into Firestore collections.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_PATH = path.join(__dirname, '../.env.local');
const DATA_DIR = path.join(__dirname, '../src/data/administrative');

// Load environment variables manually
function loadEnv() {
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    content.split('\n').forEach((line) => {
      const parts = line.trim().split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        // Remove enclosing quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'e-bhoomi';
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Configure Firebase Admin
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`Connecting to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}...`);
  admin.initializeApp({ projectId });
} else if (projectId && clientEmail && privateKey) {
  console.log(`Connecting to Production Firebase Project: ${projectId}...`);
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} else {
  console.warn('⚠️ Firebase Admin environment variables are missing. Defaulting to local connection (requires emulator or active ADC)...');
  admin.initializeApp({ projectId });
}

const db = admin.firestore();

async function seedCollection(filename, collectionName, idField) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing seed file: ${filename}`);
    return;
  }

  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Seeding ${items.length} items into collection '${collectionName}'...`);

  // Write in batches of 500
  let batch = db.batch();
  let count = 0;

  for (const item of items) {
    const id = item[idField];
    if (!id) continue;

    const ref = db.collection(collectionName).doc(id);
    batch.set(ref, {
      ...item,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    count++;

    if (count % 500 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`Successfully seeded ${count} items in '${collectionName}'.`);
}

async function run() {
  try {
    console.log('🚀 Initiating master data seeding...');
    
    // Seed locations
    await seedCollection('states.json', 'states', 'state_code');
    await seedCollection('districts.json', 'districts', 'district_code');
    await seedCollection('revenue-divisions.json', 'revenueDivisions', 'division_code');
    await seedCollection('subdistricts.json', 'mandals', 'subdistrict_code');
    await seedCollection('localities.json', 'localities', 'locality_code');
    await seedCollection('villages.json', 'villages', 'village_code');
    await seedCollection('sachivalayams.json', 'sachivalayams', 'sachivalayam_code');

    console.log('✅ Master data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
}

run();
