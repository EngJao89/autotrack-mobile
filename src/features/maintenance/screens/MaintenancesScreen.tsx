import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  ApiError,
  listMaintenances,
  listVehicles,
  type Maintenance,
  type Vehicle,
} from '@/services/api';
import { useAppTheme } from '@/theme';

import { MaintenanceCard } from '../components/MaintenanceCard';
import { MaintenanceListState } from '../components/MaintenanceListState';
import { buildMaintenanceHistory, toMaintenanceHistoryCard } from '../lib/history';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Maintenance history (ATP-46).
 * Criterion: `status === 'DONE'` (API ATP-39). Open repairs and estimates stay out.
 * Ownership comes from Bearer — no userId in the client.
 */
export function MaintenancesScreen() {
  const theme = useAppTheme();
  const { profileStatus, isMockProfile, refreshProfile } = useAuth();
  const [items, setItems] = useState<Maintenance[]>([]);
  const [vehiclesById, setVehiclesById] = useState<Record<string, Vehicle>>({});
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const requestIdRef = useRef(0);

  const reload = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    const requestId = ++requestIdRef.current;
    if (mode === 'refresh') {
      setRefreshing(true);
    } else {
      setLoadState('loading');
    }
    setLoadError(null);

    try {
      // Prefer server filter; still filter/sort client-side for safety + stable order.
      const [maintenances, vehicles] = await Promise.all([
        listMaintenances({ status: 'DONE' }),
        listVehicles(),
      ]);

      if (requestId !== requestIdRef.current) return;

      const map: Record<string, Vehicle> = {};
      for (const vehicle of vehicles) {
        map[vehicle.id] = vehicle;
      }
      setVehiclesById(map);
      setItems(maintenances);
      setLoadState('ready');
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha ao carregar manutenções.';
      setLoadError(message);
      setLoadState('error');
    } finally {
      if (requestId === requestIdRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (profileStatus !== 'ready' || isMockProfile) {
        return;
      }
      void reload('initial');
      return () => {
        requestIdRef.current += 1;
      };
    }, [profileStatus, isMockProfile, reload])
  );

  const history = useMemo(() => buildMaintenanceHistory(items), [items]);

  const cards = useMemo(
    () => history.map((item) => toMaintenanceHistoryCard(item, vehiclesById[item.vehicleId])),
    [history, vehiclesById]
  );

  const listHeader = (
    <View style={{ gap: theme.spacing[4], marginBottom: theme.spacing[16] }}>
      <Text variant="title">Manutenções</Text>
      <Text variant="body" color="secondary">
        Histórico das manutenções já realizadas nos seus veículos.
      </Text>
    </View>
  );

  if (isMockProfile) {
    return (
      <Screen>
        {listHeader}
        <MaintenanceListState
          kind="error"
          message="Mock API ativo — o histórico precisa da API real. Desligue EXPO_PUBLIC_API_MOCK e sincronize o perfil."
          onRetry={() => void refreshProfile()}
        />
      </Screen>
    );
  }

  if (profileStatus === 'loading' || profileStatus === 'idle') {
    return (
      <Screen>
        {listHeader}
        <MaintenanceListState kind="loading" />
      </Screen>
    );
  }

  if (profileStatus !== 'ready') {
    return (
      <Screen>
        {listHeader}
        <MaintenanceListState
          kind="error"
          message="Perfil indisponível. Tente sincronizar novamente."
          onRetry={() => void refreshProfile()}
        />
      </Screen>
    );
  }

  if (loadState === 'loading' && cards.length === 0) {
    return (
      <Screen>
        {listHeader}
        <MaintenanceListState kind="loading" />
      </Screen>
    );
  }

  if (loadState === 'error' && cards.length === 0) {
    return (
      <Screen>
        {listHeader}
        <MaintenanceListState
          kind="error"
          message={loadError ?? 'Falha ao carregar manutenções.'}
          onRetry={() => void reload('initial')}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MaintenanceCard item={item} />}
        ListHeaderComponent={
          <View style={{ paddingTop: theme.spacing[16] }}>
            {listHeader}
            {loadState === 'error' ? (
              <View style={{ marginBottom: theme.spacing[12] }}>
                <MaintenanceListState
                  kind="error"
                  message={loadError ?? 'Falha ao atualizar manutenções.'}
                  onRetry={() => void reload('refresh')}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={loadState === 'ready' ? <MaintenanceListState kind="empty" /> : null}
        contentContainerStyle={{
          paddingHorizontal: theme.layout.screenPadding,
          paddingBottom: theme.spacing[24],
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing[12] }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void reload('refresh')}
            tintColor={theme.colors.text.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={7}
        accessibilityLabel="Lista de manutenções realizadas"
      />
    </Screen>
  );
}
