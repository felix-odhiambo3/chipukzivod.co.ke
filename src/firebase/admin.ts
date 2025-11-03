import admin from 'firebase-admin';

/**
 * Initializes and returns the Firebase Admin SDK instance, ensuring it only happens once.
 * This is the robust way to handle initialization in serverless environments like Next.js.
 */
function getFirebaseAdminApp() {
  // If the app is already initialized, return the existing instance.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  // If not initialized, retrieve credentials from environment variables.
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
    // Initialize the Firebase Admin SDK.
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error(
      'Failed to initialize Firebase Admin SDK. Ensure your service account credentials are correct. ' +
      error.message
    );
  }
}

/**
 * Returns an object containing the initialized Firebase Admin services.
 * This function should be called by all server-side code that needs to interact
 * with Firebase Admin services.
 */
export function getFirebaseAdmin() {
  const adminApp = getFirebaseAdminApp();

  return {
    adminAuth: admin.auth(adminApp),
    adminDb: admin.firestore(adminApp),
    adminApp: adminApp,
  };
}
