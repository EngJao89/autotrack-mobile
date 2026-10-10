import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme } from './dark';
import { lightTheme } from './light';
import type { Theme, ThemeMode } from './types';

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children: ReactNode;
  /** Force a mode. When omitted, follows the system preference. */
  mode?: ThemeMode;
};

/**
 * Provides semantic design tokens to the tree.
 *
 * Dark mode strategy (ATP-8):
 * - Light and dark palettes are defined.
 * - Default behavior follows the OS color scheme.
 * - Manual preference persistence is deferred; pass `mode` when a future
 *   settings flow needs to override the system value.
 */
export function AppThemeProvider({ children, mode }: AppThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolvedMode: ThemeMode = mode ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: resolvedMode,
      theme: resolvedMode === 'dark' ? darkTheme : lightTheme,
    }),
    [resolvedMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx.theme;
}

export function useThemeMode(): ThemeMode {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }
  return ctx.mode;
}
