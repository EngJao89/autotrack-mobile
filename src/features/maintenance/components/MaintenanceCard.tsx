import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

import type { MaintenanceHistoryCardModel } from '../lib/history';

type MaintenanceCardProps = {
  item: MaintenanceHistoryCardModel;
};

/**
 * Read-only history card (ATP-46). No press handler — detail/CRUD are out of this cut.
 */
export function MaintenanceCard({ item }: MaintenanceCardProps) {
  const theme = useAppTheme();

  return (
    <Card>
      <View style={{ gap: theme.spacing[4] }}>
        <Text variant="subtitle">{item.title}</Text>
        <Text variant="bodySmall" color="secondary">
          {item.vehicleLabel}
        </Text>
        {item.serviceDate ? (
          <Text variant="caption" color="secondary">
            {item.serviceDate}
          </Text>
        ) : null}
        {item.odometer ? (
          <Text variant="caption" color="secondary">
            {item.odometer}
          </Text>
        ) : null}
        {item.cost ? (
          <Text variant="caption" color="secondary">
            {item.cost}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
