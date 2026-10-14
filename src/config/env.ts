/**
 * Public client configuration only.
 * Never put Firebase Admin credentials, private keys, or API secrets here.
 */

import { Platform } from 'react-native';

import {
  getFirebaseConfigErrorMessage,
  validateFirebaseClientConfig,
  type FirebaseConfigIssue,
} from './firebaseConfig';

function readPublic(value: string | undefined): string {
  return (value ?? '').trim().replace(/^['"]|['"]$/g, '');
}

export const env = {
  appEnv: readPublic(process.env.EXPO_PUBLIC_APP_ENV) || 'development',
  apiUrl: readPublic(process.env.EXPO_PUBLIC_API_URL),
  /** When true, profile bootstrap uses a local mock if the API is unavailable. */
  apiMock: (readPublic(process.env.EXPO_PUBLIC_API_MOCK) || 'true') === 'true',
  firebase: {
    apiKey: readPublic(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain: readPublic(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: readPublic(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: readPublic(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: readPublic(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: readPublic(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
  },
  google: {
    /** Web client ID from Google Cloud / Firebase (used by AuthSession + Firebase). */
    webClientId: readPublic(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    iosClientId: readPublic(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
    androidClientId: readPublic(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
  },
} as const;

export function getFirebaseConfigIssues(): FirebaseConfigIssue[] {
  return validateFirebaseClientConfig(env.firebase);
}

/** True only when Firebase Web client config passes shape validation. */
export function isFirebaseConfigured(): boolean {
  return getFirebaseConfigIssues().length === 0;
}

export function getFirebaseSetupMessage(): string {
  const issues = getFirebaseConfigIssues();
  if (issues.length === 0) {
    return 'Firebase configurado.';
  }
  return getFirebaseConfigErrorMessage(issues);
}

/** True when the platform-specific Google OAuth client ID is available. */
export function isGoogleConfigured(): boolean {
  if (Platform.OS === 'android') {
    return Boolean(env.google.androidClientId || env.google.webClientId);
  }
  if (Platform.OS === 'ios') {
    return Boolean(env.google.iosClientId || env.google.webClientId);
  }
  return Boolean(env.google.webClientId);
}

export function getGoogleConfigHint(): string {
  if (Platform.OS === 'android' && !env.google.androidClientId && !env.google.webClientId) {
    return 'Defina EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (ou EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) no .env.';
  }
  if (Platform.OS === 'ios' && !env.google.iosClientId && !env.google.webClientId) {
    return 'Defina EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (ou EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) no .env.';
  }
  if (!env.google.webClientId) {
    return 'Defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no .env.';
  }
  return 'Google Sign-In configurado para esta plataforma.';
}
