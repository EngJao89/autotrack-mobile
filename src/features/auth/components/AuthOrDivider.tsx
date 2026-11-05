import { View } from 'react-native';

import { Divider, Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

export function AuthOrDivider() {
  const theme = useAppTheme();

  return (
    <View
      accessibilityRole="none"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[12],
      }}
    >
      <View style={{ flex: 1 }}>
        <Divider />
      </View>
      <Text variant="caption" color="secondary" weight="medium">
        ou
      </Text>
      <View style={{ flex: 1 }}>
        <Divider />
      </View>
    </View>
  );
}
