import { forwardRef, useId, useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/theme';

import { IconButton } from '../IconButton';
import { Text } from '../Text';

export type TextInputProps = Omit<RNTextInputProps, 'editable'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  /** When `secureTextEntry` is set, shows an eye toggle to reveal/hide the value. */
  passwordToggle?: boolean;
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
    passwordToggle = true,
    containerStyle,
    style,
    secureTextEntry,
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
  const [revealed, setRevealed] = useState(false);
  const generatedId = useId();
  const hasError = Boolean(errorText);
  const showToggle = Boolean(secureTextEntry) && passwordToggle;
  const isSecure = Boolean(secureTextEntry) && !revealed;
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

      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <RNTextInput
          ref={ref}
          editable={!disabled}
          secureTextEntry={isSecure}
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
              paddingRight: showToggle ? theme.spacing[48] : theme.spacing[12],
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

        {showToggle ? (
          <View
            style={{
              position: 'absolute',
              right: theme.spacing[4],
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <IconButton
              icon={revealed ? 'eye-off-outline' : 'eye-outline'}
              accessibilityLabel={revealed ? 'Ocultar senha' : 'Mostrar senha'}
              disabled={disabled}
              color={theme.colors.text.secondary}
              onPress={() => setRevealed((current) => !current)}
            />
          </View>
        ) : null}
      </View>

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
