import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

export type CardProps = {
  children: ReactNode;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({ children, elevated = false, style, testID }: CardProps) {
  const theme = useAppTheme();

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: theme.colors.background.surface,
          borderColor: theme.colors.border.default,
          borderWidth: elevated ? 0 : StyleSheet.hairlineWidth,
          borderRadius: theme.radii.lg,
          padding: theme.spacing[16],
          ...(elevated ? theme.elevation.md : theme.elevation.none),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
