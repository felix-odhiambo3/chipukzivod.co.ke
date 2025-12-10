
import admin from 'firebase-admin';

/**
 * Initializes and returns the Firebase Admin SDK instance, ensuring it only happens once.
 * This is the robust way to handle initialization in serverless environments like Next.js.
 * It reads credentials securely from environment variables.
 */
export function getAdminApp() {
  // If the app is already initialized, return the existing instance.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase admin environment variables. Please check your .env file or hosting provider settings.');
  }

  try {
    // Initialize the Firebase Admin SDK.
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Replace escaped newlines from env var. This is the crucial fix.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error(
      'Failed to initialize Firebase Admin SDK. Ensure your service account environment variables are set correctly. ' +
      error.message
    );
  }
}
