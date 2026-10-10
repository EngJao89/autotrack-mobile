import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/theme';

import { Text } from '../Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const palette = (() => {
    switch (variant) {
      case 'secondary':
        return {
          bg: theme.colors.background.surface,
          border: theme.colors.border.default,
          text: theme.colors.text.primary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: theme.colors.brand.primary,
        };
      case 'destructive':
        return {
          bg: theme.colors.feedback.error,
          border: theme.colors.feedback.error,
          text: theme.colors.text.inverse,
        };
      case 'primary':
      default:
        return {
          bg: theme.colors.brand.primary,
          border: theme.colors.brand.primary,
          text: theme.colors.text.inverse,
        };
    }
  })();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: theme.layout.touchTargetMin,
          height: theme.layout.controlHeight,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing[16],
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth * 2 : 0,
          opacity: isDisabled ? theme.opacity.disabled : pressed ? theme.opacity.pressed : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <Text variant="label" weight="semibold" style={{ color: palette.text }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
