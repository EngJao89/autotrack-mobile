import { Platform } from 'react-native';

import type {
  ElevationScale,
  LayoutTokens,
  OpacityTokens,
  RadiiScale,
  SpacingScale,
  TypographyTokens,
} from './types';

export const spacing: SpacingScale = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
};

export const typography: TypographyTokens = {
  fontFamily: Platform.select({
    ios: { sans: 'System', mono: 'Menlo' },
    android: { sans: 'Roboto', mono: 'monospace' },
    default: { sans: 'System', mono: 'monospace' },
    web: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
  })!,
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    '2xl': 36,
  },
};

export const radii: RadiiScale = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

export const elevation: ElevationScale = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const layout: LayoutTokens = {
  screenPadding: spacing[16],
  controlHeight: 48,
  iconSize: 24,
  touchTargetMin: 44,
};

export const opacity: OpacityTokens = {
  disabled: 0.4,
  pressed: 0.85,
  overlay: 0.48,
};
