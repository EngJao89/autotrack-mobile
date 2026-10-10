import { useEffect, type ReactNode } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { Loading } from '@/components/ui';
import { AuthProvider, useAuth } from '@/features/auth';
import { AppThemeProvider } from '@/theme';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: ReactNode }) {
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

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthGate>
      </AuthProvider>
    </AppThemeProvider>
  );
}
