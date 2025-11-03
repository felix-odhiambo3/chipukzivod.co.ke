
'use server';
import { config } from 'dotenv';
config();

import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as z from 'zod';

// This utility function ensures the Firebase Admin app is initialized only once.
function initializeAdminApp(): App {
  const appName = 'admin-actions';
  const existingApp = getApps().find(app => app.name === appName);
  if (existingApp) {
    return existingApp;
  }
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Please check your environment configuration.'
    );
  }

  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  const firebaseAdminConfig = {
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey,
    }),
  };
  
  try {
    return initializeApp(firebaseAdminConfig, appName);
  } catch (error: any) {
    console.error('Admin SDK init error', error);
    throw new Error('Failed to parse private key. Ensure FIREBASE_PRIVATE_KEY is correctly formatted in your environment. ' + error.message);
  }
}


const adminApp = initializeAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

const userFormSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['member', 'admin']).default('member'), // Default to member
  photoURL: z.string().url().optional().or(z.literal('')),
});

// For update, role is still needed
const userUpdateSchema = userFormSchema.extend({
  role: z.enum(['member', 'admin']),
});

export type UserFormData = z.infer<typeof userFormSchema>;

const ADMIN_EMAIL = 'admin@chipukizivod.co.ke';

export async function createUser(data: UserFormData) {
  const validation = userFormSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid user data.');
  }

  if (!data.password) {
    throw new Error('Password is required to create a new user.');
  }
  
  const role = 'member';

  try {
    await adminAuth.getUserByEmail(data.email);
    // If the above line does not throw, it means the user exists.
    throw new Error('An account with this email already exists.');
  } catch (error: any) {
    // We expect 'auth/user-not-found'. If it's any other error, re-throw it.
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
    // If user is not found, we can proceed.
  }


  // Create user in Firebase Auth
  const userRecord = await adminAuth.createUser({
    email: data.email,
    password: data.password,
    displayName: data.displayName,
    photoURL: data.photoURL,
  });

  // Set custom claim for role. This is the secure way to handle roles.
  await adminAuth.setCustomUserClaims(userRecord.uid, { role });

  // Create user profile in Firestore
  const userDocRef = adminDb.collection('users').doc(userRecord.uid);
  await userDocRef.set({
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    role: role, // Storing role here is for client-side display convenience
    createdAt: adminDb.FieldValue.serverTimestamp(),
  });

  return { uid: userRecord.uid };
}

export async function updateUser(uid: string, data: Partial<z.infer<typeof userUpdateSchema>>) {
  const { displayName, role, photoURL } = data;

  const authUpdates: any = {};
  if (displayName) authUpdates.displayName = displayName;
  if (photoURL !== undefined) authUpdates.photoURL = photoURL;
  
  if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(uid, authUpdates);
  }
  
  const batch = adminDb.batch();
  const userDocRef = adminDb.collection('users').doc(uid);
  
  const dbUpdates: any = {};
  if (displayName) dbUpdates.displayName = displayName;
  if (photoURL !== undefined) dbUpdates.photoURL = photoURL;
  if (role) dbUpdates.role = role; // Also update Firestore doc for consistency

  if (Object.keys(dbUpdates).length > 0) {
      batch.update(userDocRef, dbUpdates);
  }

  if (role) {
    const userToUpdate = await adminAuth.getUser(uid);
    // SECURITY: Only allow the designated admin email to be promoted to admin.
    if (role === 'admin' && userToUpdate.email?.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error('This user cannot be assigned the admin role.');
    }
    
    // Securely update the custom claim
    await adminAuth.setCustomUserClaims(uid, { role });
    const adminRoleRef = adminDb.collection('roles_admin').doc(uid);
    if (role === 'admin') {
        batch.set(adminRoleRef, { isAdmin: true });
    } else {
        batch.delete(adminRoleRef);
    }
  }

  await batch.commit();

  return { uid };
}

export async function deleteUser(uid: string) {
    try {
        const userToDelete = await adminAuth.getUser(uid);
        
        if (userToDelete.email?.toLowerCase() === ADMIN_EMAIL) {
          throw new Error('The primary admin account cannot be deleted.');
        }

        const batch = adminDb.batch();
        
        // Delete from Auth first
        await adminAuth.deleteUser(uid);
        
        // Then delete from Firestore user collection
        const userDocRef = adminDb.collection('users').doc(uid);
        batch.delete(userDocRef);

        // Also delete from admin roles collection if they were an admin
        const adminRoleRef = adminDb.collection('roles_admin').doc(uid);
        batch.delete(adminRoleRef);

        await batch.commit();

        return { success: true, uid };
    } catch (error: any) {
        console.error(`Failed to delete user ${uid}:`, error);
        return { success: false, error: error.message };
    }
}

export async function sendPasswordReset(email: string) {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/login`,
    handleCodeInApp: true,
  };

  const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
  console.log('Password reset link for admin action:', link);
  return { message: `A password reset link for ${email} has been generated. Check server logs.` };
}
