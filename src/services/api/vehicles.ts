import { apiRequest } from './client';
import type { CreateVehicleInput, UpdateVehicleInput, Vehicle } from './types';

export function listVehicles(options?: {
  idToken?: string | null;
  signal?: AbortSignal;
}): Promise<Vehicle[]> {
  return apiRequest<Vehicle[]>('/v1/vehicles', {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function getVehicle(
  id: string,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/v1/vehicles/${id}`, {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function createVehicle(
  body: CreateVehicleInput,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Vehicle> {
  return apiRequest<Vehicle>('/v1/vehicles', {
    method: 'POST',
    body,
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function updateVehicle(
  id: string,
  body: UpdateVehicleInput,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/v1/vehicles/${id}`, {
    method: 'PATCH',
    body,
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function deleteVehicle(
  id: string,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<void> {
  return apiRequest<void>(`/v1/vehicles/${id}`, {
    method: 'DELETE',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}
