import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

import { Text } from '../Text';

export type LoadingProps = {
  label?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Loading({ label, fullScreen = false, style, testID }: LoadingProps) {
  const theme = useAppTheme();

  const content = (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Carregando'}
      style={[
        styles.center,
        { gap: theme.spacing[8], padding: theme.spacing[16] },
        !fullScreen && style,
      ]}
    >
      <ActivityIndicator color={theme.colors.brand.primary} size={fullScreen ? 'large' : 'small'} />
      {label ? (
        <Text variant="bodySmall" color="secondary">
          {label}
        </Text>
      ) : null}
    </View>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.center,
        {
          backgroundColor: theme.colors.background.canvas,
          opacity: 1,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
