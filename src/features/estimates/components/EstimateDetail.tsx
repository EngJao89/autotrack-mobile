import { ScrollView, View } from 'react-native';

import { Badge, Button, Text } from '@/components/ui';
import type { RepairEstimate, RepairEstimateStatus, Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { categoryLabel, estimateStatusLabel, formatCentsBRL } from '../lib/format';
import { allowedEstimateTransitions } from '../lib/status';

type EstimateDetailProps = {
  estimate: RepairEstimate;
  vehicle?: Vehicle;
  busy?: boolean;
  onChangeStatus: (next: RepairEstimateStatus) => void;
  onClose: () => void;
};

export function EstimateDetail({
  estimate,
  vehicle,
  busy,
  onChangeStatus,
  onClose,
}: EstimateDetailProps) {
  const theme = useAppTheme();
  const transitions = allowedEstimateTransitions(estimate.status);

  return (
    <ScrollView>
      <View style={{ gap: theme.spacing[12] }}>
        <Text variant="subtitle">{estimate.title}</Text>
        <Badge label={estimateStatusLabel(estimate.status)} tone="neutral" />

        {vehicle ? (
          <Text variant="body" color="secondary">
            Veículo: {vehicle.brand} {vehicle.model}
          </Text>
        ) : null}

        {estimate.description ? (
          <Text variant="body" color="secondary">
            {estimate.description}
          </Text>
        ) : null}

        <Text variant="subtitle">{formatCentsBRL(estimate.totalCents)}</Text>
        <Text variant="caption" color="secondary">
          Total calculado pela API ({estimate.currency})
        </Text>

        <Text variant="label">Itens</Text>
        {estimate.items.map((item) => (
          <View key={item.id} style={{ gap: theme.spacing[4] }}>
            <Text variant="body">
              {item.description} · {categoryLabel(item.category)}
            </Text>
            <Text variant="caption" color="secondary">
              {item.quantity} × {formatCentsBRL(item.unitPriceCents)} ={' '}
              {formatCentsBRL(item.lineTotalCents)}
            </Text>
          </View>
        ))}

        {transitions.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[8] }}>
            {transitions.map((next) => (
              <Button
                key={next}
                label={estimateStatusLabel(next)}
                variant="secondary"
                onPress={() => onChangeStatus(next)}
                disabled={busy}
                accessibilityLabel={`Alterar status para ${estimateStatusLabel(next)}`}
              />
            ))}
          </View>
        ) : null}

        <Button label="Fechar" variant="secondary" onPress={onClose} disabled={busy} />
      </View>
    </ScrollView>
  );
}
