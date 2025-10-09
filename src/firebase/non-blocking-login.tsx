'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    // Although not a Firestore error, we can use the same system to surface it.
    console.error("Anonymous sign-in error:", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      const permissionError = new FirestorePermissionError({
        path: `auth/email-signup`,
        operation: 'create',
        requestResourceData: { email, error: error.code },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      const permissionError = new FirestorePermissionError({
        path: `auth/email-signin`,
        operation: 'get',
        requestResourceData: { email, error: error.code },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}
