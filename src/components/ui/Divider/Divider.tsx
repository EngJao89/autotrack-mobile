import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

export type DividerProps = {
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Divider({ style, testID }: DividerProps) {
  const theme = useAppTheme();

  return (
    <View
      testID={testID}
      accessibilityRole="none"
      style={[
        {
          height: 1,
          width: '100%',
          backgroundColor: theme.colors.border.default,
        },
        style,
      ]}
    />
  );
}
