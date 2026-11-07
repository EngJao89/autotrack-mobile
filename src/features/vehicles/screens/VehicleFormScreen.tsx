import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Loading, Screen, Text } from '@/components/ui';
import { useSessionStore } from '@/features/auth';
import {
  ApiError,
  createVehicle,
  getVehicle,
  updateVehicle,
  type CreateVehicleInput,
  type Vehicle,
} from '@/services/api';
import { useAppTheme } from '@/theme';

import { VehicleForm } from '../components/VehicleForm';

type Mode = 'create' | 'edit';
type BootState = 'ready' | 'loading' | 'error';

function paramId(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
}

type VehicleFormScreenProps = {
  mode: Mode;
};

export function VehicleFormScreen({ mode }: VehicleFormScreenProps) {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicleId = paramId(params.vehicleId);
  const setSelectedVehicleId = useSessionStore((s) => s.setSelectedVehicleId);
  const missingEditId = mode === 'edit' && !vehicleId;

  const [initial, setInitial] = useState<Vehicle | null>(null);
  const [bootState, setBootState] = useState<BootState>(mode === 'edit' ? 'loading' : 'ready');
  const [bootError, setBootError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (mode !== 'edit' || !vehicleId) {
        return;
      }

      let cancelled = false;
      setBootState('loading');
      setBootError(null);

      void getVehicle(vehicleId)
        .then((vehicle) => {
          if (cancelled) return;
          setInitial(vehicle);
          setBootState('ready');
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          const message =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Falha ao carregar o veículo.';
          setBootError(message);
          setBootState('error');
        });

      return () => {
        cancelled = true;
      };
    }, [mode, vehicleId])
  );

  const onSubmit = async (body: CreateVehicleInput) => {
    setSubmitting(true);
    try {
      if (mode === 'create') {
        const created = await createVehicle(body);
        setSelectedVehicleId(created.id);
        router.replace(`/vehicles/${created.id}`);
        return;
      }
      if (!vehicleId) {
        throw new Error('Veículo não encontrado.');
      }
      const updated = await updateVehicle(vehicleId, body);
      router.replace(`/vehicles/${updated.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (missingEditId) {
    return (
      <Screen scroll>
        <Card>
          <View style={{ gap: theme.spacing[12] }}>
            <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
              Veículo não encontrado.
            </Text>
            <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing[16] }}>
        {bootState === 'loading' ? <Loading label="Carregando…" /> : null}

        {bootState === 'error' ? (
          <Card>
            <View style={{ gap: theme.spacing[12] }}>
              <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
                {bootError}
              </Text>
              <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
            </View>
          </Card>
        ) : null}

        {bootState === 'ready' ? (
          <VehicleForm
            mode={mode}
            initial={initial ?? undefined}
            submitting={submitting}
            onSubmit={onSubmit}
            onCancel={() => router.back()}
          />
        ) : null}
      </View>
    </Screen>
  );
}
