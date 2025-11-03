const admin = require('firebase-admin');

const ADMIN_EMAIL = 'admin@chipukizivod.co.ke';
const ADMIN_PASSWORD = 'Admin123!';

let adminApp;

// --- Initialize Firebase Admin SDK ---
// This is the secure way to initialize on the server.
// It uses environment variables and handles the private key formatting.

// Helper function to initialize the app
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Please check your environment configuration.');
  }

  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    throw new Error('Failed to initialize Firebase Admin. Ensure your credentials are correct and the private key is properly formatted.');
  }
}

try {
  adminApp = initializeAdminApp();
} catch(error) {
    console.error(error);
    process.exit(1);
}

const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);

async function seedAdminUser() {
  console.log('--- Starting Admin User Seeding ---');

  try {
    // 1. Check if the admin user already exists
    let user = await adminAuth.getUserByEmail(ADMIN_EMAIL).catch(() => null);

    if (user) {
      console.log(`✅ Admin account for ${ADMIN_EMAIL} already exists. Verifying roles...`);
      // Ensure custom claims and Firestore documents are correct
      const claims = user.customClaims;
      if (!claims || claims.role !== 'admin') {
        console.log('🔧 Missing or incorrect custom claim. Setting { role: "admin" }...');
        await adminAuth.setCustomUserClaims(user.uid, { role: 'admin' });
      }

      const adminRoleDoc = await adminDb.collection('roles_admin').doc(user.uid).get();
      if (!adminRoleDoc.exists) {
        console.log('🔧 Missing Firestore admin role document. Creating...');
        await adminDb.collection('roles_admin').doc(user.uid).set({ isAdmin: true });
      }
      
      const userDoc = await adminDb.collection('users').doc(user.uid).get();
      if (!userDoc.exists || userDoc.data().role !== 'admin') {
          console.log('🔧 Missing or incorrect Firestore user document. Creating/updating...');
          await adminDb.collection('users').doc(user.uid).set({
              email: ADMIN_EMAIL,
              displayName: 'Admin User',
              role: 'admin'
          }, { merge: true });
      }

      console.log('✅ Admin user verified and configured correctly.');
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

    // 4. Create the user document in Firestore and the admin role document in a batch
    const batch = adminDb.batch();
    
    const userDocRef = adminDb.collection('users').doc(userRecord.uid);
    batch.set(userDocRef, {
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      role: 'admin', // Stored for client-side convenience
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✓ User document queued for creation in 'users/${userRecord.uid}'.`);

    const adminRoleRef = adminDb.collection('roles_admin').doc(userRecord.uid);
    batch.set(adminRoleRef, { isAdmin: true });
    console.log(`✓ Admin role document queued for creation in 'roles_admin/${userRecord.uid}'.`);
    
    await batch.commit();
    console.log('✓ Batch commit successful.');

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
