import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { Platform } from 'react-native';

import { getFirebaseSetupMessage, isFirebaseConfigured, isGoogleConfigured } from '@/config/env';
import { getFirebaseAuth } from '@/services/firebase';

import { mapFirebaseError } from '../mapFirebaseError';

export type AuthCredentials = {
  email: string;
  password: string;
};

/** Codes that must not reveal whether an e-mail is registered (password reset). */
const PASSWORD_RESET_ENUMERATION_CODES = new Set(['auth/user-not-found', 'auth/invalid-email']);

function assertFirebaseReady(): void {
  if (!isFirebaseConfigured()) {
    throw new Error(getFirebaseSetupMessage());
  }
}

async function withMappedFirebaseError<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}

export async function signInWithEmail({
  email,
  password,
}: AuthCredentials): Promise<UserCredential> {
  assertFirebaseReady();
  return withMappedFirebaseError(() =>
    signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
  );
}

export async function registerWithEmail({
  email,
  password,
}: AuthCredentials): Promise<UserCredential> {
  assertFirebaseReady();
  // Never send password anywhere except Firebase Auth SDK.
  return withMappedFirebaseError(() =>
    createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
  );
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured()) {
    return;
  }
  await firebaseSignOut(getFirebaseAuth());
}

/**
 * Sends Firebase password-reset e-mail.
 * Never reveals whether the address is registered (enumeration-safe UX).
 */
export async function requestPasswordReset(email: string): Promise<void> {
  assertFirebaseReady();
  const normalized = email.trim();

  try {
    await sendPasswordResetEmail(getFirebaseAuth(), normalized);
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';

    if (PASSWORD_RESET_ENUMERATION_CODES.has(code) || code.includes('user-not-found')) {
      return;
    }

    throw new Error(mapFirebaseError(error));
  }
}

export async function getIdToken(user: FirebaseUser, forceRefresh = false): Promise<string> {
  return user.getIdToken(forceRefresh);
}

/**
 * Completes Google → Firebase credential exchange.
 * Requires a Google OAuth `id_token` (AuthSession or native Google Sign-In).
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<UserCredential> {
  assertFirebaseReady();
  if (!isGoogleConfigured()) {
    throw new Error(
      'Google Sign-In não configurado. Defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no .env.'
    );
  }

  return withMappedFirebaseError(() => {
    const credential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(getFirebaseAuth(), credential);
  });
}

export function getGooglePlatformHint(): string {
  if (Platform.OS === 'web') {
    return 'No web, o fluxo OAuth do Google usa o client ID web do Firebase/Google Cloud.';
  }
  return 'No iOS/Android, o login Google via AuthSession funciona melhor em development build (scheme do app). Expo Go tem limitações de redirect OAuth.';
}
