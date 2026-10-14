import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AuthGate, AuthProvider } from '@/features/auth';
import { AppThemeProvider } from '@/theme';

SplashScreen.preventAutoHideAsync();

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
