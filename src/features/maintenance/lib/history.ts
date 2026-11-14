import type { Maintenance, MaintenanceStatus, Vehicle } from '@/services/api';

export const NOT_INFORMED = 'Não informado';

/**
 * Criterion for “manutenção realizada” (ATP-46).
 * Aligns with API ATP-39 / kanban: only `DONE` is concluded service.
 * Missing/unknown status is treated as historical DONE (never invent pending).
 */
export function normalizeMaintenanceStatus(value: unknown): MaintenanceStatus {
  if (value === 'TODO' || value === 'IN_PROGRESS' || value === 'DONE') {
    return value;
  }
  return 'DONE';
}

export function isCompletedMaintenance(item: Pick<Maintenance, 'status'>): boolean {
  return normalizeMaintenanceStatus(item.status) === 'DONE';
}

/** Title: description when present, otherwise type. Never invent text. */
export function maintenanceServiceTitle(item: Pick<Maintenance, 'description' | 'type'>): string {
  const description = item.description?.trim();
  if (description) return description;
  return String(item.type);
}

export function formatMaintenanceDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toLocaleDateString('pt-BR');
}

export function formatMaintenanceOdometer(km: number | null | undefined): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  return `${km.toLocaleString('pt-BR')} km`;
}

/** BRL from `costCents`; null/undefined → omit (do not invent R$ 0,00). */
export function formatMaintenanceCost(cents: number | null | undefined): string | null {
  if (cents == null || !Number.isFinite(cents)) return null;
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatMaintenanceVehicleLabel(vehicle: Vehicle | undefined): string {
  if (!vehicle) return NOT_INFORMED;
  const name = `${vehicle.brand} ${vehicle.model}`.trim();
  const parts = [name || null, vehicle.year ? String(vehicle.year) : null].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : NOT_INFORMED;
}

/**
 * Completed first by `serviceDate` descending (realization date when DONE).
 * Invalid/missing dates last; stable tie-break on `id`.
 */
export function sortCompletedMaintenances(items: Maintenance[]): Maintenance[] {
  const copy = [...items];
  copy.sort((a, b) => {
    const aTime = Date.parse(a.serviceDate);
    const bTime = Date.parse(b.serviceDate);
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);
    if (aValid && bValid && bTime !== aTime) return bTime - aTime;
    if (aValid !== bValid) return aValid ? -1 : 1;
    return a.id.localeCompare(b.id);
  });
  return copy;
}

/** Filter + sort for the history list. Dedupes by `id` if the API ever repeats rows. */
export function buildMaintenanceHistory(items: Maintenance[]): Maintenance[] {
  const seen = new Set<string>();
  const completed: Maintenance[] = [];
  for (const item of items) {
    if (!isCompletedMaintenance(item)) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    completed.push(item);
  }
  return sortCompletedMaintenances(completed);
}

export type MaintenanceHistoryCardModel = {
  id: string;
  title: string;
  vehicleLabel: string;
  serviceDate: string | null;
  odometer: string | null;
  cost: string | null;
};

export function toMaintenanceHistoryCard(
  item: Maintenance,
  vehicle?: Vehicle
): MaintenanceHistoryCardModel {
  return {
    id: item.id,
    title: maintenanceServiceTitle(item),
    vehicleLabel: formatMaintenanceVehicleLabel(vehicle),
    serviceDate: formatMaintenanceDate(item.serviceDate),
    odometer: formatMaintenanceOdometer(item.odometerKm),
    cost: formatMaintenanceCost(item.costCents),
  };
}

/** Field → UI inventory for ATP-46 cards (optional fields omitted when absent). */
export const MAINTENANCE_HISTORY_FIELD_MAP = {
  title: 'Serviço',
  vehicleLabel: 'Veículo',
  serviceDate: 'Data do serviço',
  odometer: 'Quilometragem',
  cost: 'Valor do serviço (BRL via costCents)',
} as const;
