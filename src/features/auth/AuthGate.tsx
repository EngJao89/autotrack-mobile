import { useEffect, type ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { Loading } from '@/components/ui';

import { useAuth } from './AuthProvider';

/**
 * Route guard for Expo Router. Lives in the auth feature so `src/app` only composes providers.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    if ((status === 'unauthenticated' || status === 'unconfigured') && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [status, segments, router]);

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [status]);

  if (status === 'loading') {
    return <Loading fullScreen label="Verificando sessão…" />;
  }

  return <>{children}</>;
}
