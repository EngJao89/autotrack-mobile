import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Badge, Button, Divider, Text } from '@/components/ui';
import type { Maintenance, Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { buildMaintenanceDetailRows } from '../lib/detailFormat';
import { statusLabel } from '../lib/kanban';

type RepairDetailProps = {
  item: Maintenance;
  vehicle?: Vehicle;
  onClose: () => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing[8] }}>
      <Text variant="label" color="secondary">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing[4] }}>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

/**
 * Read-only bottom-sheet content for a maintenance (ATP-48).
 * Shows business fields only — no ids/tokens/JSON dump.
 */
export function RepairDetail({ item, vehicle, onClose }: RepairDetailProps) {
  const theme = useAppTheme();
  const rows = buildMaintenanceDetailRows(item, vehicle);

  return (
    <View style={{ gap: theme.spacing[16], maxHeight: '100%' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: theme.spacing[16], paddingBottom: theme.spacing[8] }}
      >
        <Section title="Resumo">
          <Text variant="subtitle">{rows.title}</Text>
          <Badge label={statusLabel(rows.status)} tone="neutral" />
          <Field label="Tipo" value={rows.type} />
        </Section>

        <Divider />

        <Section title="Veículo">
          <Field label="Veículo" value={rows.vehicleLabel} />
          {rows.plate ? <Field label="Placa" value={rows.plate} /> : null}
        </Section>

        <Divider />

        <Section title="Serviço">
          {rows.description ? <Field label="Descrição" value={rows.description} /> : null}
          {rows.notes ? <Field label="Observações" value={rows.notes} /> : null}
          {rows.workshop ? <Field label="Oficina" value={rows.workshop} /> : null}
          {!rows.description && !rows.notes && !rows.workshop ? (
            <Text variant="body" color="secondary">
              Sem descrição, observações ou oficina informadas.
            </Text>
          ) : null}
        </Section>

        <Divider />

        <Section title="Datas e valores">
          <Field label={rows.serviceDateLabel} value={rows.serviceDate} />
          <Field label="Quilometragem" value={rows.odometer} />
          <Field label="Valor do serviço" value={rows.cost} />
        </Section>
      </ScrollView>

      <Button label="Fechar" variant="secondary" onPress={onClose} />
    </View>
  );
}
