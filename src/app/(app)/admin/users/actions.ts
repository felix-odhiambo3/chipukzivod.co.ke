'use server';

import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as z from 'zod';

// Ensure Firebase Admin is initialized only once
if (!getApps().length) {
  initializeApp();
}

const adminAuth = getAuth();
const adminDb = getFirestore();

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

  // Set custom claim for role
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

  // Update user in Firebase Auth
  await adminAuth.updateUser(uid, {
    displayName,
    photoURL,
  });

  // Update role if it has changed
  if (role) {
    await adminAuth.setCustomUserClaims(uid, { role });
  }

  // Update user profile in Firestore
  const userDocRef = adminDb.collection('users').doc(uid);
  await userDocRef.update({
    displayName,
    photoURL,
    role,
  });

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
  // In a real app, you would use a service to send this link via email.
  // For this example, we'll just return it (or log it).
  console.log('Password reset link:', link);
  // This action itself doesn't send the email but generates the link.
  // Firebase handles sending the email if you use the client SDK's sendPasswordResetEmail.
  // To use the Admin SDK to send it, you would need your own email sending service.
  // Here we assume the built-in email will be triggered if configured in Firebase Console.
  // For the purpose of this tool, we'll just call the function.
  // This is a placeholder for a real email sending implementation.
  // We will rely on Firebase's built-in email functionality for password resets triggered via client SDK,
  // but for an admin-initiated reset, this would be the flow. We'll simulate the "request" part.
  return { message: `A password reset link would be sent to ${email}.` };
}

