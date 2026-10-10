import type { TextStyle, ViewStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export type ColorTokens = {
  brand: {
    primary: string;
    secondary: string;
  };
  background: {
    canvas: string;
    surface: string;
  };
  text: {
    primary: string;
    secondary: string;
    inverse: string;
  };
  border: {
    default: string;
  };
  feedback: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
};

export type SpacingScale = {
  0: number;
  4: number;
  8: number;
  12: number;
  16: number;
  20: number;
  24: number;
  32: number;
  40: number;
  48: number;
};

export type FontSizeScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
};

export type FontWeightScale = {
  regular: TextStyle['fontWeight'];
  medium: TextStyle['fontWeight'];
  semibold: TextStyle['fontWeight'];
  bold: TextStyle['fontWeight'];
};

export type LineHeightScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
};

export type TypographyTokens = {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: FontSizeScale;
  fontWeight: FontWeightScale;
  lineHeight: LineHeightScale;
};

export type RadiiScale = {
  none: number;
  sm: number;
  md: number;
  lg: number;
  full: number;
};

export type ElevationStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export type ElevationScale = {
  none: ElevationStyle;
  sm: ElevationStyle;
  md: ElevationStyle;
  lg: ElevationStyle;
};

export type LayoutTokens = {
  screenPadding: number;
  controlHeight: number;
  iconSize: number;
  touchTargetMin: number;
};

export type OpacityTokens = {
  disabled: number;
  pressed: number;
  overlay: number;
};

export type Theme = {
  mode: ThemeMode;
  colors: ColorTokens;
  spacing: SpacingScale;
  typography: TypographyTokens;
  radii: RadiiScale;
  elevation: ElevationScale;
  layout: LayoutTokens;
  opacity: OpacityTokens;
};
