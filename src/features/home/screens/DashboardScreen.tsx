import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Badge, Button, Card, Loading, Screen, Text } from '@/components/ui';
import { useAuth, useSessionStore } from '@/features/auth';
import {
  ApiError,
  createVehicle,
  createVehicleMaintenance,
  listMaintenances,
  listVehicles,
  updateMaintenance,
  type CreateMaintenanceInput,
  type CreateVehicleInput,
  type Maintenance,
  type MaintenanceStatus,
  type Vehicle,
} from '@/services/api';
import { useAppTheme } from '@/theme';

import { CreateRepairForm } from '../components/CreateRepairForm';
import { CreateVehicleForm } from '../components/CreateVehicleForm';
import { RepairCard } from '../components/RepairCard';
import { SummaryRow } from '../components/SummaryRow';
import { VehiclePicker } from '../components/VehiclePicker';
import {
  KANBAN_COLUMNS,
  countByStatus,
  groupByStatus,
  normalizeStatus,
  repairTitle,
  statusLabel,
} from '../lib/kanban';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SheetMode = 'none' | 'repair' | 'vehicle' | 'detail';

/**
 * Product home (ATP-39): maintenance dashboard + kanban.
 * Replaces the technical SessionHomeScreen as the authenticated entry.
 */
export function DashboardScreen() {
  const theme = useAppTheme();
  const { profileStatus, profileError, isMockProfile, refreshProfile, signOut } = useAuth();
  const selectedVehicleId = useSessionStore((s) => s.selectedVehicleId);
  const setSelectedVehicleId = useSessionStore((s) => s.setSelectedVehicleId);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [repairs, setRepairs] = useState<Maintenance[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<MaintenanceStatus>('TODO');
  const [sheet, setSheet] = useState<SheetMode>('none');
  const [selectedRepair, setSelectedRepair] = useState<Maintenance | null>(null);
  const [mutating, setMutating] = useState(false);

  const vehicleFilter = selectedVehicleId;

  const reload = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);
    try {
      const [nextVehicles, nextRepairs] = await Promise.all([
        listVehicles(),
        listMaintenances(vehicleFilter ? { vehicleId: vehicleFilter } : undefined),
      ]);
      setVehicles(nextVehicles);
      setRepairs(nextRepairs.map((item) => ({ ...item, status: normalizeStatus(item.status) })));
      setLoadState('ready');

      if (
        vehicleFilter &&
        nextVehicles.length > 0 &&
        !nextVehicles.some((v) => v.id === vehicleFilter)
      ) {
        setSelectedVehicleId(null);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha ao carregar o dashboard.';
      setLoadError(message);
      setLoadState('error');
    }
  }, [vehicleFilter, setSelectedVehicleId]);

  useFocusEffect(
    useCallback(() => {
      if (profileStatus !== 'ready' || isMockProfile) {
        return;
      }
      void reload();
    }, [profileStatus, isMockProfile, reload])
  );

  const counts = useMemo(() => countByStatus(repairs), [repairs]);
  const groups = useMemo(() => groupByStatus(repairs), [repairs]);
  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const columnItems = groups[activeColumn];

  const onChangeStatus = async (item: Maintenance, next: MaintenanceStatus) => {
    if (mutating) return;
    setMutating(true);
    const previous = repairs;
    setRepairs((list) => list.map((row) => (row.id === item.id ? { ...row, status: next } : row)));
    try {
      const updated = await updateMaintenance(item.id, { status: next });
      setRepairs((list) =>
        list.map((row) =>
          row.id === item.id ? { ...updated, status: normalizeStatus(updated.status) } : row
        )
      );
      if (selectedRepair?.id === item.id) {
        setSelectedRepair({ ...updated, status: normalizeStatus(updated.status) });
      }
    } catch (error) {
      setRepairs(previous);
      setLoadError(
        error instanceof Error ? error.message : 'Não foi possível atualizar o estado do reparo.'
      );
    } finally {
      setMutating(false);
    }
  };

  const onCreateRepair = async (vehicleId: string, body: CreateMaintenanceInput) => {
    setMutating(true);
    try {
      await createVehicleMaintenance(vehicleId, body);
      setSheet('none');
      await reload();
    } finally {
      setMutating(false);
    }
  };

  const onCreateVehicle = async (body: CreateVehicleInput) => {
    setMutating(true);
    try {
      const created = await createVehicle(body);
      setSelectedVehicleId(created.id);
      setSheet('none');
      await reload();
    } finally {
      setMutating(false);
    }
  };

  const openNewRepair = () => {
    if (vehicles.length === 0) {
      setSheet('vehicle');
      return;
    }
    setSheet('repair');
  };

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
            <Text variant="title">AutoTrack</Text>
            <Text variant="body" color="secondary">
              Acompanhe reparos e manutenções dos seus veículos.
            </Text>
          </View>
          <Button label="Sair" variant="secondary" onPress={() => void signOut()} />
        </View>

        {profileStatus === 'error' ? (
          <Card>
            <View style={{ gap: theme.spacing[12] }}>
              <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
                {profileError ?? 'Não foi possível sincronizar o perfil.'}
              </Text>
              <Button
                label="Tentar novamente"
                variant="secondary"
                onPress={() => void refreshProfile()}
              />
            </View>
          </Card>
        ) : null}

        {isMockProfile ? (
          <Card>
            <Text variant="body" color="secondary">
              Mock API ativo — o dashboard precisa da API real. Desligue EXPO_PUBLIC_API_MOCK e
              sincronize o perfil.
            </Text>
            <View style={{ marginTop: theme.spacing[12] }}>
              <Button
                label="Sincronizar perfil"
                variant="secondary"
                onPress={() => void refreshProfile()}
              />
            </View>
          </Card>
        ) : null}

        {profileStatus === 'ready' && !isMockProfile ? (
          <>
            <VehiclePicker
              vehicles={vehicles}
              selectedVehicleId={vehicleFilter}
              onSelect={setSelectedVehicleId}
            />

            {loadState === 'loading' && repairs.length === 0 ? (
              <Loading label="Carregando…" />
            ) : null}

            {loadState === 'error' ? (
              <Card>
                <View style={{ gap: theme.spacing[12] }}>
                  <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
                    {loadError}
                  </Text>
                  <Button label="Tentar novamente" onPress={() => void reload()} />
                </View>
              </Card>
            ) : null}

            {loadState === 'ready' && vehicles.length === 0 ? (
              <Card elevated>
                <View style={{ gap: theme.spacing[12] }}>
                  <Text variant="subtitle">Nenhum veículo</Text>
                  <Text variant="body" color="secondary">
                    Cadastre um veículo próprio para começar a registrar reparos.
                  </Text>
                  <Button label="Cadastrar veículo" onPress={() => setSheet('vehicle')} />
                </View>
              </Card>
            ) : null}

            {vehicles.length > 0 ? (
              <>
                <SummaryRow counts={counts} />

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: theme.spacing[8],
                  }}
                >
                  <Text variant="subtitle">Reparos</Text>
                  <Button label="Novo reparo" onPress={openNewRepair} />
                </View>

                <View style={{ flexDirection: 'row', gap: theme.spacing[8] }}>
                  {KANBAN_COLUMNS.map((column) => {
                    const selected = activeColumn === column.status;
                    return (
                      <Pressable
                        key={column.status}
                        onPress={() => setActiveColumn(column.status)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`${column.label}, ${counts[column.status]} itens`}
                        style={{
                          flex: 1,
                          paddingVertical: theme.spacing[8],
                          borderBottomWidth: 2,
                          borderBottomColor: selected
                            ? theme.colors.brand.primary
                            : theme.colors.border.default,
                          alignItems: 'center',
                          gap: theme.spacing[4],
                        }}
                      >
                        <Text variant="label" color={selected ? 'brand' : 'secondary'}>
                          {column.label}
                        </Text>
                        <Badge label={String(counts[column.status])} tone="neutral" />
                      </Pressable>
                    );
                  })}
                </View>

                {columnItems.length === 0 ? (
                  <Card>
                    <Text variant="body" color="secondary">
                      Nenhum reparo em “{statusLabel(activeColumn)}”.
                      {activeColumn === 'TODO' ? ' Use “Novo reparo” para adicionar um item.' : ''}
                    </Text>
                  </Card>
                ) : (
                  <View style={{ gap: theme.spacing[12] }}>
                    {columnItems.map((item) => (
                      <RepairCard
                        key={item.id}
                        item={item}
                        vehicle={vehicleMap.get(item.vehicleId)}
                        showVehicle={!vehicleFilter}
                        busy={mutating}
                        onOpen={(repair) => {
                          setSelectedRepair(repair);
                          setSheet('detail');
                        }}
                        onChangeStatus={(repair, next) => void onChangeStatus(repair, next)}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : null}
          </>
        ) : null}

        {profileStatus === 'loading' ? <Loading label="Preparando sessão…" /> : null}
      </View>

      <Modal
        visible={sheet !== 'none'}
        animationType="slide"
        transparent
        onRequestClose={() => setSheet('none')}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background.canvas,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              padding: theme.spacing[20],
              gap: theme.spacing[12],
              maxHeight: '90%',
            }}
          >
            {sheet === 'repair' ? (
              <CreateRepairForm
                vehicles={vehicles}
                preferredVehicleId={vehicleFilter}
                submitting={mutating}
                onSubmit={onCreateRepair}
                onCancel={() => setSheet('none')}
              />
            ) : null}

            {sheet === 'vehicle' ? (
              <CreateVehicleForm
                submitting={mutating}
                onSubmit={onCreateVehicle}
                onCancel={() => setSheet('none')}
              />
            ) : null}

            {sheet === 'detail' && selectedRepair ? (
              <View style={{ gap: theme.spacing[12] }}>
                <Text variant="subtitle">{repairTitle(selectedRepair)}</Text>
                <Badge label={statusLabel(selectedRepair.status)} tone="neutral" />
                <Text variant="body" color="secondary">
                  Tipo: {selectedRepair.type}
                </Text>
                <Text variant="body" color="secondary">
                  Data: {new Date(selectedRepair.serviceDate).toLocaleDateString('pt-BR')}
                </Text>
                {selectedRepair.workshopName ? (
                  <Text variant="body" color="secondary">
                    Oficina: {selectedRepair.workshopName}
                  </Text>
                ) : null}
                {selectedRepair.notes ? (
                  <Text variant="body" color="secondary">
                    Notas: {selectedRepair.notes}
                  </Text>
                ) : null}
                <Button label="Fechar" variant="secondary" onPress={() => setSheet('none')} />
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
