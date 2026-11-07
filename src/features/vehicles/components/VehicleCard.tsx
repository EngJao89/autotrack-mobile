import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import type { Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { vehicleSubtitle, vehicleTitle } from '../lib/format';

type VehicleCardProps = {
  vehicle: Vehicle;
  onPress?: () => void;
};

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const theme = useAppTheme();
  const content = (
    <View style={{ gap: theme.spacing[4] }}>
      <Text variant="subtitle">{vehicleTitle(vehicle)}</Text>
      <Text variant="bodySmall" color="secondary">
        {vehicleSubtitle(vehicle)}
      </Text>
      {vehicle.odometerKm != null ? (
        <Text variant="caption" color="secondary">
          {vehicle.odometerKm.toLocaleString('pt-BR')} km
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) {
    return <Card>{content}</Card>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${vehicleTitle(vehicle)}`}
    >
      <Card>{content}</Card>
    </Pressable>
  );
}
