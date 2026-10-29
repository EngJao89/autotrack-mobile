import { useState } from 'react';
import { View } from 'react-native';

import { Button, Text, TextInput } from '@/components/ui';
import type { CreateMaintenanceInput, MaintenanceType, Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

const TYPES: MaintenanceType[] = [
  'Preventiva',
  'Corretiva',
  'Revisão',
  'Troca de óleo',
  'Pneus',
  'Freios',
  'Elétrica',
  'Outro',
];

type CreateRepairFormProps = {
  vehicles: Vehicle[];
  preferredVehicleId: string | null;
  submitting: boolean;
  onSubmit: (vehicleId: string, body: CreateMaintenanceInput) => Promise<void>;
  onCancel: () => void;
};

export function CreateRepairForm({
  vehicles,
  preferredVehicleId,
  submitting,
  onSubmit,
  onCancel,
}: CreateRepairFormProps) {
  const theme = useAppTheme();
  const [vehicleId, setVehicleId] = useState(
    preferredVehicleId && vehicles.some((v) => v.id === preferredVehicleId)
      ? preferredVehicleId
      : (vehicles[0]?.id ?? '')
  );
  const [typeIndex, setTypeIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const cycleType = () => setTypeIndex((i) => (i + 1) % TYPES.length);

  const submit = async () => {
    setError(null);
    if (!vehicleId) {
      setError('Selecione um veículo.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
      setError('Use a data no formato AAAA-MM-DD.');
      return;
    }

    try {
      await onSubmit(vehicleId, {
        type: TYPES[typeIndex],
        status: 'TODO',
        serviceDate: new Date(`${serviceDate}T12:00:00.000Z`).toISOString(),
        description: description.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar reparo.');
    }
  };

  return (
    <View style={{ gap: theme.spacing[12] }}>
      <Text variant="subtitle">Novo reparo</Text>

      <Text variant="label">Veículo</Text>
      <Button
        label={
          vehicles.find((v) => v.id === vehicleId)
            ? `${vehicles.find((v) => v.id === vehicleId)!.brand} ${vehicles.find((v) => v.id === vehicleId)!.model}`
            : 'Selecionar'
        }
        variant="secondary"
        onPress={() => {
          const idx = vehicles.findIndex((v) => v.id === vehicleId);
          const next = vehicles[(idx + 1) % vehicles.length];
          if (next) setVehicleId(next.id);
        }}
        disabled={vehicles.length === 0 || submitting}
      />

      <Text variant="label">Tipo</Text>
      <Button
        label={TYPES[typeIndex]}
        variant="secondary"
        onPress={cycleType}
        disabled={submitting}
      />

      <TextInput
        label="Descrição (opcional)"
        value={description}
        onChangeText={setDescription}
        disabled={submitting}
      />

      <TextInput
        label="Data prevista (AAAA-MM-DD)"
        value={serviceDate}
        onChangeText={setServiceDate}
        autoCapitalize="none"
        disabled={submitting}
      />

      {error ? (
        <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label="Salvar"
        onPress={() => void submit()}
        loading={submitting}
        disabled={submitting}
      />
      <Button label="Cancelar" variant="secondary" onPress={onCancel} disabled={submitting} />
    </View>
  );
}
