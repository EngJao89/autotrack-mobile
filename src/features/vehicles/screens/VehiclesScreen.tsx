import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { ApiError, listVehicles, type Vehicle } from '@/services/api';
import { useAppTheme } from '@/theme';

import { VehicleCard } from '../components/VehicleCard';
import { VehicleListState } from '../components/VehicleListState';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Vehicle list (ATP-37). Ownership comes from Bearer on the API — no userId in the client.
 */
export function VehiclesScreen() {
  const theme = useAppTheme();
  const { profileStatus, isMockProfile, refreshProfile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);
    try {
      const next = await listVehicles();
      setVehicles(next);
      setLoadState('ready');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha ao carregar veículos.';
      setLoadError(message);
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (profileStatus !== 'ready' || isMockProfile) {
        return;
      }
      void reload();
    }, [profileStatus, isMockProfile, reload])
  );

  const goNew = () => router.push('/vehicles/new');

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing[20] }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: theme.spacing[12],
          }}
        >
          <View style={{ flex: 1, gap: theme.spacing[4] }}>
            <Text variant="title">Veículos</Text>
            <Text variant="body" color="secondary">
              Cadastro e gestão dos seus veículos na API.
            </Text>
          </View>
          <Button
            label="Novo"
            onPress={goNew}
            disabled={isMockProfile || profileStatus !== 'ready'}
          />
        </View>

        {isMockProfile ? (
          <VehicleListState
            kind="error"
            message="Mock API ativo — cadastro de veículos precisa da API real. Desligue EXPO_PUBLIC_API_MOCK e sincronize o perfil."
            onRetry={() => void refreshProfile()}
          />
        ) : null}

        {profileStatus === 'ready' && !isMockProfile ? (
          <>
            {loadState === 'loading' && vehicles.length === 0 ? (
              <VehicleListState kind="loading" />
            ) : null}

            {loadState === 'error' ? (
              <VehicleListState
                kind="error"
                message={loadError ?? 'Falha ao carregar veículos.'}
                onRetry={() => void reload()}
              />
            ) : null}

            {loadState === 'ready' && vehicles.length === 0 ? (
              <VehicleListState kind="empty" onCreate={goNew} />
            ) : null}

            {vehicles.length > 0 ? (
              <View style={{ gap: theme.spacing[12] }}>
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onPress={() => router.push(`/vehicles/${vehicle.id}`)}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        {profileStatus === 'loading' || profileStatus === 'idle' ? (
          <VehicleListState kind="loading" />
        ) : null}
      </View>
    </Screen>
  );
}
