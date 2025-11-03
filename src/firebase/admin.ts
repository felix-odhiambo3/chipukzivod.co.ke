
import admin from 'firebase-admin';

// This is a singleton pattern to ensure we only initialize the Firebase Admin SDK once.
let adminApp: admin.app.App | null = null;

/**
 * Initializes and returns the Firebase Admin SDK instance.
 *
 * It ensures that `initializeApp` is called only once per process,
 * which is a requirement for the Firebase Admin SDK.
 */
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    // If the app is already initialized, return the existing instance.
    return admin.apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // The private key must have its newlines escaped when stored in an environment variable.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Please check your environment configuration.'
    );
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return app;
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error(
      'Failed to initialize Firebase Admin SDK. Ensure your service account credentials in the environment variables are correct. ' +
      error.message
    );
  }
}

/**
 * Returns a single, shared instance of the initialized Firebase Admin services.
 * This function should be called by all server-side code that needs to interact
 * with Firebase Admin services.
 */
export function getFirebaseAdmin() {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  
  if (!adminApp) {
    throw new Error("Firebase Admin App could not be initialized.");
  }

  return {
    adminAuth: admin.auth(adminApp),
    adminDb: admin.firestore(adminApp),
    adminApp: adminApp,
  };
}
