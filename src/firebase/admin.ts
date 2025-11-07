
import admin from 'firebase-admin';
import serviceAccount from '@/serviceAccountKey.json';

/**
 * Initializes and returns the Firebase Admin SDK instance, ensuring it only happens once.
 * This is the robust way to handle initialization in serverless environments like Next.js.
 */
function getFirebaseAdminApp() {
  // If the app is already initialized, return the existing instance.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  try {
    // Initialize the Firebase Admin SDK using the service account file.
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      // Add databaseURL if you use Realtime Database, otherwise it's not needed for Firestore/Auth.
      // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com` 
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    throw new Error(
      'Failed to initialize Firebase Admin SDK. Ensure your service account key is valid. ' +
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
