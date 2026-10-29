import { apiRequest } from './client';
import type {
  CreateMaintenanceInput,
  ListMaintenancesQuery,
  Maintenance,
  UpdateMaintenanceInput,
} from './types';

function toQuery(params?: ListMaintenancesQuery): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.vehicleId) search.set('vehicleId', params.vehicleId);
  if (params.status) search.set('status', params.status);
  if (params.type) search.set('type', params.type);
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Lista reparos/manutenções do usuário (todos os veículos ou filtrado). */
export function listMaintenances(
  query?: ListMaintenancesQuery,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Maintenance[]> {
  return apiRequest<Maintenance[]>(`/v1/maintenances${toQuery(query)}`, {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function listVehicleMaintenances(
  vehicleId: string,
  options?: {
    idToken?: string | null;
    signal?: AbortSignal;
    query?: ListMaintenancesQuery;
  }
): Promise<Maintenance[]> {
  const { vehicleId: _ignored, ...rest } = options?.query ?? {};
  return apiRequest<Maintenance[]>(`/v1/vehicles/${vehicleId}/maintenances${toQuery(rest)}`, {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function createVehicleMaintenance(
  vehicleId: string,
  body: CreateMaintenanceInput,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Maintenance> {
  return apiRequest<Maintenance>(`/v1/vehicles/${vehicleId}/maintenances`, {
    method: 'POST',
    body,
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function getMaintenance(
  id: string,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Maintenance> {
  return apiRequest<Maintenance>(`/v1/maintenances/${id}`, {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function updateMaintenance(
  id: string,
  body: UpdateMaintenanceInput,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Maintenance> {
  return apiRequest<Maintenance>(`/v1/maintenances/${id}`, {
    method: 'PATCH',
    body,
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function deleteMaintenance(
  id: string,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<void> {
  return apiRequest<void>(`/v1/maintenances/${id}`, {
    method: 'DELETE',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}
