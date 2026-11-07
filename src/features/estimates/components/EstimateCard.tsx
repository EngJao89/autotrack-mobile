import { View } from 'react-native';

import { Badge, Button, Card, Text } from '@/components/ui';
import type { RepairEstimate, Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { estimateStatusLabel, formatCentsBRL } from '../lib/format';

type EstimateCardProps = {
  item: RepairEstimate;
  vehicle?: Vehicle;
  showVehicle: boolean;
  busy?: boolean;
  onOpen: (item: RepairEstimate) => void;
};

export function EstimateCard({ item, vehicle, showVehicle, busy, onOpen }: EstimateCardProps) {
  const theme = useAppTheme();

  return (
    <Card elevated>
      <View style={{ gap: theme.spacing[8] }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: theme.spacing[8],
            alignItems: 'flex-start',
          }}
        >
          <Text variant="subtitle" style={{ flex: 1 }}>
            {item.title}
          </Text>
          <Badge label={estimateStatusLabel(item.status)} tone="neutral" />
        </View>

        {showVehicle && vehicle ? (
          <Text variant="caption" color="secondary">
            {vehicle.brand} {vehicle.model}
            {vehicle.year ? ` · ${vehicle.year}` : ''}
          </Text>
        ) : null}

        <Text variant="body">{formatCentsBRL(item.totalCents)}</Text>
        <Text variant="caption" color="secondary">
          {item.items.length} {item.items.length === 1 ? 'item' : 'itens'}
        </Text>

        <Button label="Detalhes" variant="secondary" onPress={() => onOpen(item)} disabled={busy} />
      </View>
    </Card>
  );
}
