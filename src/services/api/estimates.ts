import { apiRequest } from './client';
import type {
  CreateRepairEstimateInput,
  ListRepairEstimatesQuery,
  RepairEstimate,
  UpdateRepairEstimateInput,
} from './types';

function toQuery(params?: ListRepairEstimatesQuery): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.vehicleId) search.set('vehicleId', params.vehicleId);
  if (params.status) search.set('status', params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Lista orçamentos do usuário (todos os veículos ou filtrado). */
export function listRepairEstimates(
  query?: ListRepairEstimatesQuery,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<RepairEstimate[]> {
  return apiRequest<RepairEstimate[]>(`/v1/estimates${toQuery(query)}`, {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function listVehicleRepairEstimates(
  vehicleId: string,
  options?: {
    idToken?: string | null;
    signal?: AbortSignal;
    query?: ListRepairEstimatesQuery;
  }
): Promise<RepairEstimate[]> {
  const { vehicleId: _ignored, ...rest } = options?.query ?? {};
  return apiRequest<RepairEstimate[]>(`/v1/vehicles/${vehicleId}/estimates${toQuery(rest)}`, {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function createVehicleRepairEstimate(
  vehicleId: string,
  body: CreateRepairEstimateInput,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<RepairEstimate> {
  return apiRequest<RepairEstimate>(`/v1/vehicles/${vehicleId}/estimates`, {
    method: 'POST',
    body,
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function getRepairEstimate(
  id: string,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<RepairEstimate> {
  return apiRequest<RepairEstimate>(`/v1/estimates/${id}`, {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function updateRepairEstimate(
  id: string,
  body: UpdateRepairEstimateInput,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<RepairEstimate> {
  return apiRequest<RepairEstimate>(`/v1/estimates/${id}`, {
    method: 'PATCH',
    body,
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function deleteRepairEstimate(
  id: string,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<void> {
  return apiRequest<void>(`/v1/estimates/${id}`, {
    method: 'DELETE',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}
