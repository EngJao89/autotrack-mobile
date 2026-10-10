import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { Platform } from 'react-native';

import { isGoogleConfigured } from '@/config/env';

import { getFirebaseAuth } from './firebase';

export type AuthCredentials = {
  email: string;
  password: string;
};

export async function signInWithEmail({
  email,
  password,
}: AuthCredentials): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

export async function registerWithEmail({
  email,
  password,
}: AuthCredentials): Promise<UserCredential> {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export async function getIdToken(user: FirebaseUser, forceRefresh = false): Promise<string> {
  return user.getIdToken(forceRefresh);
}

/**
 * Completes Google → Firebase credential exchange.
 * Requires a Google OAuth `id_token` (AuthSession or native Google Sign-In).
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<UserCredential> {
  if (!isGoogleConfigured()) {
    throw new Error(
      'Google Sign-In não configurado. Defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no .env.'
    );
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(getFirebaseAuth(), credential);
}

export function getGooglePlatformHint(): string {
  if (Platform.OS === 'web') {
    return 'No web, o fluxo OAuth do Google usa o client ID web do Firebase/Google Cloud.';
  }
  return 'No iOS/Android, o login Google via AuthSession funciona melhor em development build (scheme do app). Expo Go tem limitações de redirect OAuth.';
}
