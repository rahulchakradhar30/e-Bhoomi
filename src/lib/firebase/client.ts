import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'e-bhoomi.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'e-bhoomi',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'e-bhoomi.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '585423835169',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:585423835169:web:3fa0c44b8dd47e3738d360',
};

/**
 * Validates whether the Firebase configuration has necessary credentials.
 */
export function checkFirebaseConfigValid(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_firebase_api_key_here') {
    missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  }
  if (!firebaseConfig.projectId) {
    missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Initialize Firebase App singleton.
 * Prevents duplicate initialization in Next.js HMR and SSR environments.
 */
export const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};

export const app = getFirebaseApp();
