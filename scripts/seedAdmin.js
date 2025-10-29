
// This script is used to seed the database with a default admin user.
// It is idempotent, meaning it can be run multiple times without creating duplicate users.

// To run this script:
// 1. Make sure your .env file is populated with the correct Firebase Admin credentials.
// 2. Run `npm run db:seed` from your terminal.

const admin = require('firebase-admin');

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

const ADMIN_EMAIL = 'admin@chipukizivod.co.ke';
const ADMIN_PASSWORD = 'Admin123!';

// --- Initialize Firebase Admin SDK ---
// This is the secure way to initialize on the server.
// It uses environment variables and handles the private key formatting.

// Helper function to initialize the app
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Firebase admin environment variables are not set. Please check your .env file.');
  }

  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    throw new Error('Failed to initialize Firebase Admin. Ensure your credentials are correct.');
  }
}

const adminApp = initializeAdminApp();
const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);

async function seedAdminUser() {
  console.log('--- Starting Admin User Seeding ---');

  try {
    // 1. Check if the admin user already exists
    const user = await adminAuth.getUserByEmail(ADMIN_EMAIL).catch(() => null);

    if (user) {
      console.log(`✅ Admin account for ${ADMIN_EMAIL} already exists. No action taken.`);
      return;
    }

    console.log(`🔧 Admin user not found. Creating account for ${ADMIN_EMAIL}...`);

    // 2. Create the user in Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Admin User',
      emailVerified: true,
    });

    console.log(`✓ User created in Auth with UID: ${userRecord.uid}`);

    // 3. Set custom user claims for role-based access
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('✓ Custom claim { role: "admin" } set successfully.');

    // 4. Create the user document in Firestore
    const userDocRef = adminDb.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      uid: userRecord.uid,
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      role: 'admin', // Stored for client-side convenience
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✓ User document created in Firestore at 'users/${userRecord.uid}'.`);
    console.log('\n🎉 --- Admin Seeding Complete! --- 🎉');
    console.log('You can now log in with the following credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);

  } catch (error) {
    console.error('\n❌ --- An error occurred during seeding --- ❌');
    console.error('Error:', error.message);
    if (error.code === 'auth/email-already-exists') {
        console.error('Hint: The user might exist but has a different UID or was created externally.');
    }
  }
}

seedAdminUser().then(() => process.exit(0));
