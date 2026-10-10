import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/theme';

export type TextVariant = 'body' | 'bodySmall' | 'label' | 'title' | 'subtitle' | 'caption';
export type TextColor =
  'primary' | 'secondary' | 'inverse' | 'brand' | 'success' | 'warning' | 'error' | 'info';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

export function Text({ variant = 'body', color = 'primary', weight, style, ...rest }: TextProps) {
  const theme = useAppTheme();

  const variantStyle: TextStyle = (() => {
    switch (variant) {
      case 'title':
        return {
          fontSize: theme.typography.fontSize['2xl'],
          lineHeight: theme.typography.lineHeight['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
        };
      case 'subtitle':
        return {
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'label':
        return {
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: theme.typography.fontWeight.medium,
        };
      case 'bodySmall':
        return {
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: theme.typography.fontWeight.regular,
        };
      case 'caption':
        return {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: theme.typography.fontWeight.regular,
        };
      case 'body':
      default:
        return {
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: theme.typography.fontWeight.regular,
        };
    }
  })();

  const colorValue = (() => {
    switch (color) {
      case 'secondary':
        return theme.colors.text.secondary;
      case 'inverse':
        return theme.colors.text.inverse;
      case 'brand':
        return theme.colors.brand.primary;
      case 'success':
        return theme.colors.feedback.success;
      case 'warning':
        return theme.colors.feedback.warning;
      case 'error':
        return theme.colors.feedback.error;
      case 'info':
        return theme.colors.feedback.info;
      case 'primary':
      default:
        return theme.colors.text.primary;
    }
  })();

  return (
    <RNText
      style={[
        {
          color: colorValue,
          fontFamily: theme.typography.fontFamily.sans,
          ...variantStyle,
          ...(weight ? { fontWeight: theme.typography.fontWeight[weight] } : null),
        },
        style,
      ]}
      {...rest}
    />
  );
}
