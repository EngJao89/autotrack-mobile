import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Text, TextInput } from '@/components/ui';
import type {
  CreateRepairEstimateInput,
  RepairEstimateItemCategory,
  RepairEstimateItemInput,
  Vehicle,
} from '@/services/api';
import { useAppTheme } from '@/theme';

import { categoryLabel, formatCentsBRL } from '../lib/format';

type DraftItem = {
  key: string;
  description: string;
  category: RepairEstimateItemCategory;
  quantity: string;
  unitPriceReais: string;
};

type CreateEstimateFormProps = {
  vehicles: Vehicle[];
  preferredVehicleId: string | null;
  submitting: boolean;
  onSubmit: (vehicleId: string, body: CreateRepairEstimateInput) => Promise<void>;
  onCancel: () => void;
};

function emptyItem(): DraftItem {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: '',
    category: 'PART',
    quantity: '1',
    unitPriceReais: '',
  };
}

function parseReaisToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  const reais = Number(normalized);
  if (!Number.isFinite(reais) || reais < 0) return null;
  return Math.round(reais * 100);
}

export function CreateEstimateForm({
  vehicles,
  preferredVehicleId,
  submitting,
  onSubmit,
  onCancel,
}: CreateEstimateFormProps) {
  const theme = useAppTheme();
  const [vehicleId, setVehicleId] = useState(
    preferredVehicleId && vehicles.some((v) => v.id === preferredVehicleId)
      ? preferredVehicleId
      : (vehicles[0]?.id ?? '')
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [error, setError] = useState<string | null>(null);

  const previewTotalCents = items.reduce((sum, item) => {
    const qty = Number.parseInt(item.quantity, 10);
    const cents = parseReaisToCents(item.unitPriceReais);
    if (!Number.isFinite(qty) || qty < 1 || cents === null) return sum;
    return sum + qty * cents;
  }, 0);

  const updateItem = (key: string, patch: Partial<DraftItem>) => {
    setItems((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const submit = async () => {
    setError(null);
    if (!vehicleId) {
      setError('Selecione um veículo.');
      return;
    }
    if (!title.trim()) {
      setError('Informe o título do orçamento.');
      return;
    }

    const parsedItems: RepairEstimateItemInput[] = [];
    for (const item of items) {
      if (!item.description.trim()) {
        setError('Cada item precisa de descrição.');
        return;
      }
      const quantity = Number.parseInt(item.quantity, 10);
      if (!Number.isFinite(quantity) || quantity < 1) {
        setError('Quantidade deve ser um inteiro ≥ 1.');
        return;
      }
      const unitPriceCents = parseReaisToCents(item.unitPriceReais);
      if (unitPriceCents === null) {
        setError('Informe o preço unitário em reais (ex.: 89,90).');
        return;
      }
      parsedItems.push({
        description: item.description.trim(),
        category: item.category,
        quantity,
        unitPriceCents,
      });
    }

    if (parsedItems.length === 0) {
      setError('Adicione ao menos um item.');
      return;
    }

    try {
      await onSubmit(vehicleId, {
        title: title.trim(),
        description: description.trim() || undefined,
        items: parsedItems,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar orçamento.');
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View style={{ gap: theme.spacing[12] }}>
        <Text variant="subtitle">Novo orçamento</Text>

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

        <TextInput label="Título" value={title} onChangeText={setTitle} disabled={submitting} />
        <TextInput
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          disabled={submitting}
        />

        <Text variant="label">Itens</Text>
        {items.map((item, index) => (
          <View
            key={item.key}
            style={{
              gap: theme.spacing[8],
              padding: theme.spacing[12],
              borderWidth: 1,
              borderColor: theme.colors.border.default,
              borderRadius: theme.radii.md,
            }}
          >
            <Text variant="caption" color="secondary">
              Item {index + 1}
            </Text>
            <TextInput
              label="Descrição"
              value={item.description}
              onChangeText={(description) => updateItem(item.key, { description })}
              disabled={submitting}
            />
            <Button
              label={`Categoria: ${categoryLabel(item.category)}`}
              variant="secondary"
              onPress={() =>
                updateItem(item.key, {
                  category: item.category === 'PART' ? 'LABOR' : 'PART',
                })
              }
              disabled={submitting}
            />
            <TextInput
              label="Quantidade"
              value={item.quantity}
              onChangeText={(quantity) => updateItem(item.key, { quantity })}
              keyboardType="number-pad"
              disabled={submitting}
            />
            <TextInput
              label="Preço unitário (R$)"
              value={item.unitPriceReais}
              onChangeText={(unitPriceReais) => updateItem(item.key, { unitPriceReais })}
              keyboardType="decimal-pad"
              disabled={submitting}
            />
            {items.length > 1 ? (
              <Button
                label="Remover item"
                variant="secondary"
                onPress={() => setItems((list) => list.filter((row) => row.key !== item.key))}
                disabled={submitting}
              />
            ) : null}
          </View>
        ))}

        <Button
          label="Adicionar item"
          variant="secondary"
          onPress={() => setItems((list) => [...list, emptyItem()])}
          disabled={submitting || items.length >= 50}
        />

        <Text variant="body" color="secondary">
          Total estimado (prévia): {formatCentsBRL(previewTotalCents)}
        </Text>
        <Text variant="caption" color="secondary">
          O total oficial é recalculado e persistido pela API após salvar.
        </Text>

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
    </ScrollView>
  );
}
