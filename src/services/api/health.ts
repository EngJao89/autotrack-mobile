import { apiRequest } from './client';
import type { HealthResponse } from './types';

/** Public health check — no Bearer token. */
export function getApiHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/v1/health', {
    method: 'GET',
    skipAuth: true,
    signal,
  });
}
