
'use server';

import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as z from 'zod';

// This is a simplified check for a Google Cloud environment.
const isGoogleCloud = !!process.env.GCP_PROJECT;

let adminApp: App;
if (!getApps().length) {
    if (isGoogleCloud) {
        // In a Google Cloud environment, the SDK can auto-discover credentials.
        adminApp = initializeApp();
    } else {
        // For local development, you MUST set the GOOGLE_APPLICATION_CREDENTIALS
        // environment variable to point to your service account key file.
        // We will try to initialize without it, but it will likely fail if not on GCP.
        try {
            adminApp = initializeApp();
        } catch (e) {
            console.error("Firebase Admin initialization failed. If you are developing locally, please ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set.", e);
            // We throw an error here because admin actions will not work without proper initialization.
            throw new Error("Firebase Admin SDK initialization failed.");
        }
    }
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

// This function is now only used by the admin panel to create users, not the public join page.
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
    role: data.role,
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
    await adminAuth.setCustomUserClaims(uid, { role });
  }

  const dbUpdates: any = {};
  if (displayName) dbUpdates.displayName = displayName;
  if (photoURL !== undefined) dbUpdates.photoURL = photoURL;
  if (role) dbUpdates.role = role;
  
  if (Object.keys(dbUpdates).length > 0) {
      const userDocRef = adminDb.collection('users').doc(uid);
      await userDocRef.update(dbUpdates);
  }

  return { uid };
}

export async function deleteUser(uid: string) {
  // Delete from Firebase Auth
  await adminAuth.deleteUser(uid);

  // Delete from Firestore
  await adminDb.collection('users').doc(uid).delete();

  return { uid };
}

export async function sendPasswordReset(email: string) {
  const link = await adminAuth.generatePasswordResetLink(email);
  console.log('Password reset link for admin action:', link);
  // In a real app, you would use an email service to send this link.
  // We'll log it for now as a placeholder for that integration.
  return { message: `A password reset link for ${email} has been generated. Check server logs.` };
}
