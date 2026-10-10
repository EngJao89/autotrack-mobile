import { elevation, layout, opacity, radii, spacing, typography } from './tokens';
import type { Theme } from './types';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    brand: {
      primary: '#1B6EF3',
      secondary: '#0E3A7A',
    },
    background: {
      canvas: '#F4F7FB',
      surface: '#FFFFFF',
    },
    text: {
      primary: '#0B1220',
      secondary: '#5B677A',
      inverse: '#FFFFFF',
    },
    border: {
      default: '#D7DEE8',
    },
    feedback: {
      success: '#1B7F4A',
      warning: '#B86E00',
      error: '#C62828',
      info: '#1565C0',
    },
  },
  spacing,
  typography,
  radii,
  elevation,
  layout,
  opacity,
};
