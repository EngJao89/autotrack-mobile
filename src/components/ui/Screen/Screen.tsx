import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  style,
  contentStyle,
  testID,
}: ScreenProps) {
  const theme = useAppTheme();

  const paddingStyle = padded
    ? {
        paddingHorizontal: theme.layout.screenPadding,
        paddingVertical: theme.spacing[16],
      }
    : null;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, paddingStyle, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, paddingStyle, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      testID={testID}
      style={[styles.root, { backgroundColor: theme.colors.background.canvas }, style]}
      edges={['top', 'left', 'right']}
    >
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
