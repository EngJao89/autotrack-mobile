import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

import { Text } from '../Text';

export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarProps = {
  name: string;
  imageUri?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function Avatar({ name, imageUri, size = 'md', style, testID }: AvatarProps) {
  const theme = useAppTheme();

  const dimension = (() => {
    switch (size) {
      case 'sm':
        return theme.spacing[32];
      case 'lg':
        return theme.spacing[48];
      case 'md':
      default:
        return theme.spacing[40];
    }
  })();

  const fontSize =
    size === 'sm'
      ? theme.typography.fontSize.xs
      : size === 'lg'
        ? theme.typography.fontSize.md
        : theme.typography.fontSize.sm;

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={`Avatar de ${name}`}
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: theme.radii.full,
          backgroundColor: theme.colors.brand.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: dimension, height: dimension }} />
      ) : (
        <Text
          variant="label"
          color="inverse"
          weight="semibold"
          style={{ fontSize, lineHeight: fontSize + 2 }}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
