import type { Maintenance, MaintenanceStatus, Vehicle } from '@/services/api';

import { normalizeStatus } from './kanban';

export const NOT_INFORMED = 'Não informado';

/** `serviceDate` semantics from API ATP-39: planned while open, service date when DONE. */
export function serviceDateLabel(status: MaintenanceStatus): string {
  return normalizeStatus(status) === 'DONE' ? 'Data do serviço' : 'Data prevista';
}

export function formatServiceDate(iso: string | null | undefined): string {
  if (!iso) return NOT_INFORMED;
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return NOT_INFORMED;
  return new Date(time).toLocaleDateString('pt-BR');
}

/** Historical km on the maintenance — never substitute vehicle.odometerKm. */
export function formatOdometerKm(km: number | null | undefined): string {
  if (km == null || !Number.isFinite(km)) return NOT_INFORMED;
  return `${km.toLocaleString('pt-BR')} km`;
}

/** Optional cost; null/undefined → not informed (do not invent R$ 0,00). */
export function formatCostCents(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return NOT_INFORMED;
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatVehicleLabel(vehicle: Vehicle | undefined): string {
  if (!vehicle) return NOT_INFORMED;
  const name = `${vehicle.brand} ${vehicle.model}`.trim();
  const parts = [name || null, vehicle.year ? String(vehicle.year) : null].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : NOT_INFORMED;
}

export function formatVehiclePlate(vehicle: Vehicle | undefined): string | null {
  const plate = vehicle?.licensePlate?.trim();
  return plate ? plate.toUpperCase() : null;
}

export function optionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Field → UI label inventory for ATP-48 (Maintenance contract).
 * Technical fields (id, vehicleId, createdAt, updatedAt) are intentionally omitted.
 */
export const MAINTENANCE_DETAIL_FIELD_MAP = {
  title: 'Serviço',
  status: 'Status',
  type: 'Tipo',
  description: 'Descrição',
  notes: 'Observações',
  vehicle: 'Veículo',
  licensePlate: 'Placa',
  odometerKm: 'Quilometragem',
  serviceDate: 'Data prevista | Data do serviço (conforme status)',
  costCents: 'Valor do serviço',
  workshopName: 'Oficina',
} as const;

export type MaintenanceDetailRows = {
  title: string;
  status: MaintenanceStatus;
  type: string;
  description: string | null;
  notes: string | null;
  vehicleLabel: string;
  plate: string | null;
  odometer: string;
  serviceDateLabel: string;
  serviceDate: string;
  cost: string;
  workshop: string | null;
};

export function buildMaintenanceDetailRows(
  item: Maintenance,
  vehicle?: Vehicle
): MaintenanceDetailRows {
  const status = normalizeStatus(item.status);
  const description = optionalText(item.description);
  const title = description ?? String(item.type);

  return {
    title,
    status,
    type: String(item.type),
    description,
    notes: optionalText(item.notes),
    vehicleLabel: formatVehicleLabel(vehicle),
    plate: formatVehiclePlate(vehicle),
    odometer: formatOdometerKm(item.odometerKm),
    serviceDateLabel: serviceDateLabel(status),
    serviceDate: formatServiceDate(item.serviceDate),
    cost: formatCostCents(item.costCents),
    workshop: optionalText(item.workshopName),
  };
}
