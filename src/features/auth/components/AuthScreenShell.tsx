import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

export type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  testID?: string;
};

export function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
  testID,
}: AuthScreenShellProps) {
  const theme = useAppTheme();

  return (
    <Screen scroll testID={testID}>
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          gap: theme.spacing[24],
          paddingTop: theme.spacing[16],
          paddingBottom: theme.spacing[32],
        }}
      >
        <View style={{ gap: theme.spacing[16], alignItems: 'flex-start' }}>
          <View
            accessibilityRole="image"
            accessibilityLabel="AutoTrack"
            style={{
              width: 56,
              height: 56,
              borderRadius: theme.radii.lg,
              backgroundColor: theme.colors.brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...theme.elevation.sm,
            }}
          >
            <Ionicons name="car-sport" size={28} color={theme.colors.text.inverse} />
          </View>

          <View style={{ gap: theme.spacing[8] }}>
            <Text variant="caption" color="brand" weight="semibold">
              AutoTrack
            </Text>
            <Text variant="title">{title}</Text>
            <Text variant="body" color="secondary">
              {subtitle}
            </Text>
          </View>
        </View>

        {children}

        {footer ? (
          <View style={{ alignItems: 'center', paddingTop: theme.spacing[4] }}>{footer}</View>
        ) : null}
      </View>
    </Screen>
  );
}
