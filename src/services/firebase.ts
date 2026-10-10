import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

import { env, isFirebaseConfigured } from '@/config/env';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase não configurado. Preencha as variáveis EXPO_PUBLIC_FIREBASE_* no arquivo .env (veja .env.example).'
    );
  }

  if (app) {
    return app;
  }

  app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: env.firebase.apiKey,
          authDomain: env.firebase.authDomain,
          projectId: env.firebase.projectId,
          storageBucket: env.firebase.storageBucket || undefined,
          messagingSenderId: env.firebase.messagingSenderId || undefined,
          appId: env.firebase.appId,
        });

  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) {
    return auth;
  }

  const firebaseApp = getFirebaseApp();

  if (Platform.OS === 'web') {
    auth = getAuth(firebaseApp);
    return auth;
  }

  try {
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    // Hot reload / second init — Auth already exists for this app.
    auth = getAuth(firebaseApp);
  }

  return auth;
}
