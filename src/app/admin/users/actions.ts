
'use server';

import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as z from 'zod';

// Securely initialize Firebase Admin SDK - This should only happen once per module load.
let adminApp: App;
if (!getApps().length) {
  // When running in a Google Cloud environment (like App Hosting or Cloud Functions),
  // the SDK automatically uses Application Default Credentials.
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

const userFormSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['member', 'admin']),
  photoURL: z.string().url().optional().or(z.literal('')),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export async function createUser(data: UserFormData) {
  const validation = userFormSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid user data.');
  }

  if (!data.password) {
    throw new Error('Password is required to create a new user.');
  }

  // Create user in Firebase Auth
  const userRecord = await adminAuth.createUser({
    email: data.email,
    password: data.password,
    displayName: data.displayName,
    photoURL: data.photoURL,
  });

  // Set custom claim for role. This is the secure way to handle roles.
  await adminAuth.setCustomUserClaims(userRecord.uid, { role: data.role });

  const batch = adminDb.batch();

  // Create user profile in Firestore
  const userDocRef = adminDb.collection('users').doc(userRecord.uid);
  batch.set(userDocRef, {
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    role: data.role, // Storing role here is for client-side display convenience
  });

  // If the user is an admin, add them to the admin roles collection
  if (data.role === 'admin') {
      const adminRoleRef = adminDb.collection('roles_admin').doc(userRecord.uid);
      batch.set(adminRoleRef, { isAdmin: true });
  }

  await batch.commit();


  return { uid: userRecord.uid };
}

export async function updateUser(uid: string, data: Partial<UserFormData>) {
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
        const batch = adminDb.batch();
        
        // Delete from Auth first
        await adminAuth.deleteUser(uid);
        
        // Then delete from Firestore user collection
        const userDocRef = adminDb.collection('users').doc(uid);
        batch.delete(userDocRef);

        // Also delete from admin roles collection
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
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/login`,
    // This must be true.
    handleCodeInApp: true,
  };

  const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
  console.log('Password reset link for admin action:', link);
  // In a real app, you would use an email service to send this link.
  return { message: `A password reset link for ${email} has been generated. Check server logs.` };
}

