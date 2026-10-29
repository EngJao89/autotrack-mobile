import { apiRequest } from './client';
import type { CreateMaintenanceInput, Maintenance, UpdateMaintenanceInput } from './types';

export function listVehicleMaintenances(
  vehicleId: string,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Maintenance[]> {
  return apiRequest<Maintenance[]>(`/v1/vehicles/${vehicleId}/maintenances`, {
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
