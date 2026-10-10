import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

import { Text } from '../Text';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Badge({ label, tone = 'neutral', style, testID }: BadgeProps) {
  const theme = useAppTheme();

  const colors = (() => {
    switch (tone) {
      case 'success':
        return { bg: `${theme.colors.feedback.success}22`, fg: theme.colors.feedback.success };
      case 'warning':
        return { bg: `${theme.colors.feedback.warning}22`, fg: theme.colors.feedback.warning };
      case 'error':
        return { bg: `${theme.colors.feedback.error}22`, fg: theme.colors.feedback.error };
      case 'info':
        return { bg: `${theme.colors.feedback.info}22`, fg: theme.colors.feedback.info };
      case 'neutral':
      default:
        return { bg: theme.colors.background.canvas, fg: theme.colors.text.secondary };
    }
  })();

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: colors.bg,
          borderRadius: theme.radii.full,
          paddingHorizontal: theme.spacing[8],
          paddingVertical: theme.spacing[4],
        },
        style,
      ]}
    >
      <Text variant="caption" weight="medium" style={{ color: colors.fg }}>
        {label}
      </Text>
    </View>
  );
}
