import { forwardRef, useId, useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/theme';

import { Text } from '../Text';

export type TextInputProps = Omit<RNTextInputProps, 'editable'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  {
    label,
    helperText,
    errorText,
    disabled = false,
    required = false,
    containerStyle,
    style,
    onFocus,
    onBlur,
    accessibilityLabel,
    testID,
    ...rest
  },
  ref
) {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const hasError = Boolean(errorText);
  const describedBy = hasError
    ? `${generatedId}-error`
    : helperText
      ? `${generatedId}-helper`
      : undefined;

  const borderColor = hasError
    ? theme.colors.feedback.error
    : focused
      ? theme.colors.brand.primary
      : theme.colors.border.default;

  return (
    <View style={[{ gap: theme.spacing[4] }, containerStyle]} testID={testID}>
      {label ? (
        <Text variant="label" color="primary">
          {label}
          {required ? (
            <Text variant="label" color="error">
              {' '}
              *
            </Text>
          ) : null}
        </Text>
      ) : null}

      <RNTextInput
        ref={ref}
        editable={!disabled}
        placeholderTextColor={theme.colors.text.secondary}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          {
            minHeight: theme.layout.touchTargetMin,
            height: theme.layout.controlHeight,
            borderWidth: 1.5,
            borderColor,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing[12],
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.background.surface,
            fontSize: theme.typography.fontSize.md,
            fontFamily: theme.typography.fontFamily.sans,
            opacity: disabled ? theme.opacity.disabled : 1,
          },
          style,
        ]}
        {...rest}
      />

      {hasError ? (
        <Text
          nativeID={`${generatedId}-error`}
          variant="caption"
          color="error"
          accessibilityLiveRegion="polite"
        >
          {errorText}
        </Text>
      ) : helperText ? (
        <Text nativeID={`${generatedId}-helper`} variant="caption" color="secondary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});
