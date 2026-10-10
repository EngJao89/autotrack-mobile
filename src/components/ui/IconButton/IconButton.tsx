import { Ionicons } from '@expo/vector-icons';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

export type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  color,
  style,
  testID,
}: IconButtonProps) {
  const theme = useAppTheme();
  const size = Math.max(theme.layout.touchTargetMin, theme.layout.iconSize + theme.spacing[16]);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radii.full,
          opacity: disabled ? theme.opacity.disabled : pressed ? theme.opacity.pressed : 1,
        },
        style,
      ]}
    >
      <Ionicons
        name={icon}
        size={theme.layout.iconSize}
        color={color ?? theme.colors.text.primary}
      />
    </Pressable>
  );
}
