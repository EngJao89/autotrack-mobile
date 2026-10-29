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

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(readPublic(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Public client configuration.
 * API fields use getters so Node tests can override `process.env` before `resetApiClientForTests()`.
 * In Expo, `EXPO_PUBLIC_*` are inlined at bundle time — getters behave like constants in the app.
 */
export const env = {
  get appEnv(): string {
    return readPublic(process.env.EXPO_PUBLIC_APP_ENV) || 'development';
  },
  get apiUrl(): string {
    return readPublic(process.env.EXPO_PUBLIC_API_URL);
  },
  /**
   * Axios timeout for autotrack-api calls (ms).
   * Render free-tier cold starts can be slow — default 30s.
   */
  get apiTimeoutMs(): number {
    return readPositiveInt(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 30_000);
  },
  /** When true, profile bootstrap uses a local mock if the API is unavailable. */
  get apiMock(): boolean {
    return (readPublic(process.env.EXPO_PUBLIC_API_MOCK) || 'true') === 'true';
  },
  firebase: {
    get apiKey(): string {
      return readPublic(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
    },
    get authDomain(): string {
      return readPublic(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN);
    },
    get projectId(): string {
      return readPublic(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
    },
    get storageBucket(): string {
      return readPublic(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET);
    },
    get messagingSenderId(): string {
      return readPublic(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
    },
    get appId(): string {
      return readPublic(process.env.EXPO_PUBLIC_FIREBASE_APP_ID);
    },
  },
  google: {
    /** Web client ID from Google Cloud / Firebase (used by AuthSession + Firebase). */
    get webClientId(): string {
      return readPublic(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
    },
    get iosClientId(): string {
      return readPublic(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
    },
    get androidClientId(): string {
      return readPublic(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
    },
  },
};

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
