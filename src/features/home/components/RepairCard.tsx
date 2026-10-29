import { View } from 'react-native';

import { Badge, Button, Card, Text } from '@/components/ui';
import type { Maintenance, MaintenanceStatus, Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { allowedTransitions, repairTitle, statusLabel } from '../lib/kanban';

type RepairCardProps = {
  item: Maintenance;
  vehicle?: Vehicle;
  showVehicle: boolean;
  busy?: boolean;
  onOpen: (item: Maintenance) => void;
  onChangeStatus: (item: Maintenance, next: MaintenanceStatus) => void;
};

function formatDate(iso: string): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return 'Sem data';
  return new Date(time).toLocaleDateString('pt-BR');
}

export function RepairCard({
  item,
  vehicle,
  showVehicle,
  busy,
  onOpen,
  onChangeStatus,
}: RepairCardProps) {
  const theme = useAppTheme();
  const transitions = allowedTransitions(item.status);

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
            {repairTitle(item)}
          </Text>
          <Badge label={statusLabel(item.status)} tone="neutral" />
        </View>

        {showVehicle && vehicle ? (
          <Text variant="caption" color="secondary">
            {vehicle.brand} {vehicle.model}
            {vehicle.year ? ` · ${vehicle.year}` : ''}
          </Text>
        ) : null}

        <Text variant="caption" color="secondary">
          Data: {formatDate(item.serviceDate)}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[8] }}>
          <Button
            label="Detalhes"
            variant="secondary"
            onPress={() => onOpen(item)}
            disabled={busy}
          />
          {transitions.map((next) => (
            <Button
              key={next}
              label={statusLabel(next)}
              variant="secondary"
              onPress={() => onChangeStatus(item, next)}
              disabled={busy}
              accessibilityLabel={`Mover para ${statusLabel(next)}`}
            />
          ))}
        </View>
      </View>
    </Card>
  );
}
