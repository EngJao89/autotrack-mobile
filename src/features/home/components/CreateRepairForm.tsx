import { useState } from 'react';
import { View } from 'react-native';

import { Button, Text, TextInput } from '@/components/ui';
import type { CreateMaintenanceInput, MaintenanceType, Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { parseReaisToCents } from '../lib/money';

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
  const [costReais, setCostReais] = useState('');
  const [costError, setCostError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cycleType = () => setTypeIndex((i) => (i + 1) % TYPES.length);

  const onChangeCost = (value: string) => {
    setCostReais(value);
    if (costError) setCostError(null);
  };

  const submit = async () => {
    setError(null);
    setCostError(null);

    if (!vehicleId) {
      setError('Selecione um veículo.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
      setError('Use a data no formato AAAA-MM-DD.');
      return;
    }

    const parsedCost = parseReaisToCents(costReais);
    if (!parsedCost.ok) {
      setCostError(parsedCost.error);
      return;
    }

    const body: CreateMaintenanceInput = {
      type: TYPES[typeIndex],
      status: 'TODO',
      serviceDate: new Date(`${serviceDate}T12:00:00.000Z`).toISOString(),
      description: description.trim() || undefined,
    };
    // Empty → omit (not informed). Explicit 0 → send 0. Never invent cost for blank.
    if (parsedCost.cents !== undefined) {
      body.costCents = parsedCost.cents;
    }

    try {
      await onSubmit(vehicleId, body);
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

      <TextInput
        label="Valor do serviço (opcional)"
        value={costReais}
        onChangeText={onChangeCost}
        keyboardType="decimal-pad"
        helperText="BRL — ex.: 150,00. Vazio = não informado; 0 = grátis."
        errorText={costError ?? undefined}
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
