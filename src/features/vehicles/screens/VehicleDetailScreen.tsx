import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Card, Loading, Screen, Text } from '@/components/ui';
import { useSessionStore } from '@/features/auth';
import { ApiError, deleteVehicle, getVehicle, type Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { formatLicensePlate } from '../lib/plate';
import { vehicleTitle } from '../lib/format';

type LoadState = 'loading' | 'ready' | 'error';

function paramId(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
}

export function VehicleDetailScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicleId = paramId(params.vehicleId);
  const selectedVehicleId = useSessionStore((s) => s.selectedVehicleId);
  const setSelectedVehicleId = useSessionStore((s) => s.setSelectedVehicleId);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    if (!vehicleId) {
      setLoadError('Veículo não encontrado.');
      setLoadState('error');
      return;
    }
    setLoadState('loading');
    setLoadError(null);
    try {
      const next = await getVehicle(vehicleId);
      setVehicle(next);
      setLoadState('ready');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha ao carregar o veículo.';
      setLoadError(message);
      setLoadState('error');
    }
  }, [vehicleId]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const confirmDelete = () => {
    if (!vehicle || deleting) return;
    Alert.alert(
      'Excluir veículo',
      `Remover ${vehicleTitle(vehicle)}? Reparos e orçamentos vinculados também serão removidos na API.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => void onDelete(),
        },
      ]
    );
  };

  const onDelete = async () => {
    if (!vehicle) return;
    setDeleting(true);
    try {
      await deleteVehicle(vehicle.id);
      if (selectedVehicleId === vehicle.id) {
        setSelectedVehicleId(null);
      }
      router.replace('/vehicles');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Não foi possível excluir o veículo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing[20] }}>
        {loadState === 'loading' ? <Loading label="Carregando…" /> : null}

        {loadState === 'error' ? (
          <Card>
            <View style={{ gap: theme.spacing[12] }}>
              <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
                {loadError}
              </Text>
              <Button label="Tentar novamente" onPress={() => void reload()} />
              <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
            </View>
          </Card>
        ) : null}

        {loadState === 'ready' && vehicle ? (
          <>
            <View style={{ gap: theme.spacing[4] }}>
              <Text variant="title">{vehicleTitle(vehicle)}</Text>
              <Text variant="body" color="secondary">
                {vehicle.year}
                {vehicle.version ? ` · ${vehicle.version}` : ''}
              </Text>
            </View>

            <Card>
              <View style={{ gap: theme.spacing[8] }}>
                <DetailRow label="Placa" value={formatLicensePlate(vehicle.licensePlate)} />
                <DetailRow label="Cor" value={vehicle.color ?? '—'} />
                <DetailRow label="Combustível" value={vehicle.fuelType ?? '—'} />
                <DetailRow
                  label="Quilometragem"
                  value={
                    vehicle.odometerKm != null
                      ? `${vehicle.odometerKm.toLocaleString('pt-BR')} km`
                      : '—'
                  }
                />
              </View>
            </Card>

            <Button
              label="Editar"
              onPress={() => router.push(`/vehicles/${vehicle.id}/edit`)}
              disabled={deleting}
            />
            <Button
              label="Excluir"
              variant="destructive"
              onPress={confirmDelete}
              loading={deleting}
              disabled={deleting}
            />
            <Button
              label="Voltar"
              variant="secondary"
              onPress={() => router.back()}
              disabled={deleting}
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}
