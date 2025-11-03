const admin = require('firebase-admin');

const ADMIN_EMAIL_TO_PROTECT = 'admin@chipukizivod.co.ke';

let adminApp;
// --- Initialize Firebase Admin SDK ---
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

async function clearAllUsers() {
  console.log('--- Starting User Deletion Process ---');
  console.log('WARNING: This will permanently delete all non-admin user accounts.');

  try {
    const allUsers = await adminAuth.listUsers(1000); // Batches of 1000
    const usersToDelete = allUsers.users.filter(user => user.email.toLowerCase() !== ADMIN_EMAIL_TO_PROTECT.toLowerCase());

    if (usersToDelete.length === 0) {
      console.log('✅ No non-admin users found to delete.');
      return;
    }

    const uidsToDelete = usersToDelete.map(user => user.uid);
    console.log(`🔧 Found ${uidsToDelete.length} user(s) to delete...`);

    // Batch delete from Firebase Authentication
    const deleteResult = await adminAuth.deleteUsers(uidsToDelete);
    console.log(`✓ Successfully deleted ${deleteResult.successCount} user(s) from Firebase Authentication.`);
    if (deleteResult.failureCount > 0) {
      console.error(`❌ Failed to delete ${deleteResult.failureCount} user(s). See errors below:`);
      deleteResult.errors.forEach(error => {
        console.error(`   - UID: ${uidsToDelete[error.index]}, Error: ${error.error.message}`);
      });
    }

    // Batch delete from Firestore
    console.log('🔧 Deleting corresponding user documents from Firestore...');
    const batch = adminDb.batch();
    uidsToDelete.forEach(uid => {
      const userDocRef = adminDb.collection('users').doc(uid);
      batch.delete(userDocRef);
    });
    await batch.commit();
    console.log('✓ Successfully deleted user documents from Firestore.');

    console.log('\n🎉 --- User Deletion Complete! --- 🎉');

  } catch (error) {
    console.error('\n❌ --- An error occurred during user deletion --- ❌');
    console.error('Error:', error.message);
  }
}

clearAllUsers().then(() => process.exit(0));
