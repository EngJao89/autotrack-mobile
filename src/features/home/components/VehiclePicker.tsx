import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import type { Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

type VehiclePickerProps = {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelect: (vehicleId: string | null) => void;
};

function chipLabel(vehicle: Vehicle): string {
  return `${vehicle.brand} ${vehicle.model}`;
}

export function VehiclePicker({ vehicles, selectedVehicleId, onSelect }: VehiclePickerProps) {
  const theme = useAppTheme();
  const allSelected = selectedVehicleId === null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: theme.spacing[8] }}>
        <Chip label="Todos os veículos" selected={allSelected} onPress={() => onSelect(null)} />
        {vehicles.map((vehicle) => (
          <Chip
            key={vehicle.id}
            label={chipLabel(vehicle)}
            selected={selectedVehicleId === vehicle.id}
            onPress={() => onSelect(vehicle.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        paddingHorizontal: theme.spacing[12],
        paddingVertical: theme.spacing[8],
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: selected ? theme.colors.brand.primary : theme.colors.border.default,
        backgroundColor: selected ? theme.colors.brand.primary : theme.colors.background.surface,
      }}
    >
      <Text variant="label" color={selected ? 'inverse' : 'primary'}>
        {label}
      </Text>
    </Pressable>
  );
}
