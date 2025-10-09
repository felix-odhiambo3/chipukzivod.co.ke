'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
} from 'firebase/auth';

/**
 * A strongly-typed pub/sub event emitter for auth errors.
 */
const authErrorEmitter = {
  listeners: [] as ((error: AuthError) => void)[],
  on(listener: (error: AuthError) => void) {
    this.listeners.push(listener);
  },
  off(listener: (error: AuthError) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  },
  emit(error: AuthError) {
    this.listeners.forEach(listener => listener(error));
  }
};

export { authErrorEmitter };


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    authErrorEmitter.emit(error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      authErrorEmitter.emit(error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      authErrorEmitter.emit(error);
    });
}
