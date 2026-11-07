import { useState } from 'react';
import { View } from 'react-native';

import { Button, Text, TextInput } from '@/components/ui';
import type { CreateVehicleInput } from '@/services/api';
import { useAppTheme } from '@/theme';

import {
  fieldsFromVehicle,
  getVehicleYearMax,
  parseVehicleForm,
  type VehicleFormFields,
  VEHICLE_YEAR_MIN,
} from '../lib/validation';

type VehicleFormProps = {
  mode: 'create' | 'edit';
  initial?: Parameters<typeof fieldsFromVehicle>[0];
  submitting: boolean;
  submitLabel?: string;
  onSubmit: (body: CreateVehicleInput) => Promise<void>;
  onCancel: () => void;
};

const emptyFields = (): VehicleFormFields => ({
  brand: '',
  model: '',
  year: String(new Date().getFullYear()),
  version: '',
  licensePlate: '',
  color: '',
  fuelType: '',
  odometerKm: '',
});

export function VehicleForm({
  mode,
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const theme = useAppTheme();
  const [fields, setFields] = useState<VehicleFormFields>(() =>
    initial ? fieldsFromVehicle(initial) : emptyFields()
  );
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof VehicleFormFields>(key: K, value: VehicleFormFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setError(null);
    const parsed = parseVehicleForm(fields);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar veículo.');
    }
  };

  const yearHint = `Entre ${VEHICLE_YEAR_MIN} e ${getVehicleYearMax()}`;

  return (
    <View style={{ gap: theme.spacing[12] }}>
      <Text variant="subtitle">{mode === 'create' ? 'Cadastrar veículo' : 'Editar veículo'}</Text>
      <Text variant="body" color="secondary">
        Marca, modelo e ano são obrigatórios. Placa é normalizada em maiúsculas (sem unicidade
        global).
      </Text>

      <TextInput
        label="Marca"
        value={fields.brand}
        onChangeText={(v) => setField('brand', v)}
        disabled={submitting}
        required
      />
      <TextInput
        label="Modelo"
        value={fields.model}
        onChangeText={(v) => setField('model', v)}
        disabled={submitting}
        required
      />
      <TextInput
        label="Ano"
        value={fields.year}
        onChangeText={(v) => setField('year', v)}
        keyboardType="number-pad"
        helperText={yearHint}
        disabled={submitting}
        required
      />
      <TextInput
        label="Versão"
        value={fields.version}
        onChangeText={(v) => setField('version', v)}
        disabled={submitting}
      />
      <TextInput
        label="Placa"
        value={fields.licensePlate}
        onChangeText={(v) => setField('licensePlate', v)}
        autoCapitalize="characters"
        helperText="Opcional · máx. 10 caracteres"
        disabled={submitting}
      />
      <TextInput
        label="Cor"
        value={fields.color}
        onChangeText={(v) => setField('color', v)}
        disabled={submitting}
      />
      <TextInput
        label="Combustível"
        value={fields.fuelType}
        onChangeText={(v) => setField('fuelType', v)}
        helperText="Ex.: flex, gasoline, ethanol, diesel"
        disabled={submitting}
      />
      <TextInput
        label="Quilometragem (km)"
        value={fields.odometerKm}
        onChangeText={(v) => setField('odometerKm', v)}
        keyboardType="number-pad"
        disabled={submitting}
      />

      {error ? (
        <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label={submitLabel ?? (mode === 'create' ? 'Salvar veículo' : 'Salvar alterações')}
        onPress={() => void submit()}
        loading={submitting}
        disabled={submitting}
      />
      <Button label="Cancelar" variant="secondary" onPress={onCancel} disabled={submitting} />
    </View>
  );
}
