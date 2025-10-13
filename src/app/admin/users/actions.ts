
'use server';

import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as z from 'zod';

// Securely initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  // In a deployed environment (like Firebase App Hosting), the SDK
  // will automatically use Google Application Default Credentials.
  // No explicit credential configuration is needed.
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

  // Create user profile in Firestore
  const userDocRef = adminDb.collection('users').doc(userRecord.uid);
  await userDocRef.set({
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    role: data.role, // Storing role here is for client-side display convenience
  });

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

  if (role) {
    // Securely update the custom claim
    await adminAuth.setCustomUserClaims(uid, { role });
  }

  const dbUpdates: any = {};
  if (displayName) dbUpdates.displayName = displayName;
  if (photoURL !== undefined) dbUpdates.photoURL = photoURL;
  if (role) dbUpdates.role = role; // Also update Firestore doc for consistency
  
  if (Object.keys(dbUpdates).length > 0) {
      const userDocRef = adminDb.collection('users').doc(uid);
      await userDocRef.update(dbUpdates);
  }

  return { uid };
}

export async function deleteUser(uid: string) {
    try {
        // Delete from Auth first
        await adminAuth.deleteUser(uid);
        // Then delete from Firestore
        await adminDb.collection('users').doc(uid).delete();
        return { success: true, uid };
    } catch (error: any) {
        console.error(`Failed to delete user ${uid}:`, error);
        return { success: false, error: error.message };
    }
}

export async function sendPasswordReset(email: string) {
  const link = await adminAuth.generatePasswordResetLink(email);
  console.log('Password reset link for admin action:', link);
  // In a real app, you would use an email service to send this link.
  return { message: `A password reset link for ${email} has been generated. Check server logs.` };
}
