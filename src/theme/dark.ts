import { elevation, layout, opacity, radii, spacing, typography } from './tokens';
import type { Theme } from './types';

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    brand: {
      primary: '#5B9BFF',
      secondary: '#9EC2FF',
    },
    background: {
      canvas: '#0B1220',
      surface: '#151D2C',
    },
    text: {
      primary: '#F5F7FA',
      secondary: '#A7B0C0',
      inverse: '#0B1220',
    },
    border: {
      default: '#2A3548',
    },
    feedback: {
      success: '#3DDB8A',
      warning: '#FFB020',
      error: '#FF6B6B',
      info: '#64B5F6',
    },
  },
  spacing,
  typography,
  radii,
  elevation,
  layout,
  opacity,
};
