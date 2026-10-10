/**
 * Public client configuration only.
 * Never put Firebase Admin credentials, private keys, or API secrets here.
 */

import { Platform } from 'react-native';

export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV?.trim() || 'development',
  apiUrl: process.env.EXPO_PUBLIC_API_URL?.trim() || '',
  /** When true, profile bootstrap uses a local mock if the API is unavailable. */
  apiMock: (process.env.EXPO_PUBLIC_API_MOCK?.trim() || 'true') === 'true',
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() || '',
  },
  google: {
    /** Web client ID from Google Cloud / Firebase (used by AuthSession + Firebase). */
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || '',
  },
} as const;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    env.firebase.apiKey && env.firebase.authDomain && env.firebase.projectId && env.firebase.appId
  );
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
