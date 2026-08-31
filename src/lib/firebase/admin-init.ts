import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK singleton for server-side environments.
 * Prevents multiple initializations in Next.js Server Components, Actions, and API Routes.
 */
let adminApp: admin.app.App | null = null;

export const getFirebaseAdminApp = (): admin.app.App => {
  if (adminApp) {
    return adminApp;
  }
  
  if (admin.apps.length > 0) {
    adminApp = admin.apps[0] as admin.app.App;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Support inline newlines in the private key environment variable
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY 
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  // If credentials are missing, create a placeholder app to avoid build-time errors during Next.js static pre-rendering
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ FIREBASE_ADMIN_* environment variables are missing. Initializing fallback/emulator/placeholder app.');
    
    // In emulator mode:
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST) {
      adminApp = admin.initializeApp({
        projectId: projectId || 'e-bhoomi'
      });
      return adminApp;
    }

    // Build-time placeholder app:
    adminApp = admin.initializeApp({
      projectId: 'e-bhoomi-placeholder',
      credential: {
        getAccessToken: async () => ({
          access_token: 'placeholder_token',
          expires_in: 3600
        })
      }
    }, 'placeholder-app');
    
    return adminApp;
  }

  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  
  return adminApp;
};

const getAdminAuth = (): admin.auth.Auth => {
  const app = getFirebaseAdminApp();
  if (app.name === 'placeholder-app') {
    throw new Error('Firebase Admin SDK configuration environment variables are missing. Cannot execute Admin Auth operations.');
  }
  return admin.auth(app);
};

const getAdminDb = (): admin.firestore.Firestore => {
  const app = getFirebaseAdminApp();
  if (app.name === 'placeholder-app') {
    throw new Error('Firebase Admin SDK configuration environment variables are missing. Cannot execute Firestore operations.');
  }
  return admin.firestore(app);
};

// ES6 Proxies to lazily load Admin instances only when methods are called at runtime.
// This prevents Next.js next build phase from failing when credentials are not supplied during compilation.
export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(target, prop, receiver) {
    const instance = getAdminAuth();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop, receiver) {
    const instance = getAdminDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export default adminAuth;
