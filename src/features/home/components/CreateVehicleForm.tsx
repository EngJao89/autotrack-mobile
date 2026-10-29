import { useState } from 'react';
import { View } from 'react-native';

import { Button, Text, TextInput } from '@/components/ui';
import type { CreateVehicleInput } from '@/services/api';
import { useAppTheme } from '@/theme';

type CreateVehicleFormProps = {
  submitting: boolean;
  onSubmit: (body: CreateVehicleInput) => Promise<void>;
  onCancel: () => void;
};

export function CreateVehicleForm({ submitting, onSubmit, onCancel }: CreateVehicleFormProps) {
  const theme = useAppTheme();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const yearNum = Number.parseInt(year, 10);
    if (!brand.trim() || !model.trim()) {
      setError('Informe marca e modelo.');
      return;
    }
    if (!Number.isFinite(yearNum) || yearNum < 1900) {
      setError('Ano inválido.');
      return;
    }

    try {
      await onSubmit({
        brand: brand.trim(),
        model: model.trim(),
        year: yearNum,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar veículo.');
    }
  };

  return (
    <View style={{ gap: theme.spacing[12] }}>
      <Text variant="subtitle">Cadastrar veículo</Text>
      <Text variant="body" color="secondary">
        É preciso ter ao menos um veículo próprio antes de abrir um reparo.
      </Text>

      <TextInput label="Marca" value={brand} onChangeText={setBrand} disabled={submitting} />
      <TextInput label="Modelo" value={model} onChangeText={setModel} disabled={submitting} />
      <TextInput
        label="Ano"
        value={year}
        onChangeText={setYear}
        keyboardType="number-pad"
        disabled={submitting}
      />

      {error ? (
        <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label="Salvar veículo"
        onPress={() => void submit()}
        loading={submitting}
        disabled={submitting}
      />
      <Button label="Cancelar" variant="secondary" onPress={onCancel} disabled={submitting} />
    </View>
  );
}
