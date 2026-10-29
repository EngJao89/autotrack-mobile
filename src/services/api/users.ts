import { apiRequest } from './client';
import type { ApiUser, UpdateUserInput } from './types';

export function getCurrentUser(options?: {
  idToken?: string | null;
  signal?: AbortSignal;
}): Promise<ApiUser> {
  return apiRequest<ApiUser>('/v1/users/me', {
    method: 'GET',
    idToken: options?.idToken,
    signal: options?.signal,
  });
}

export function updateCurrentUser(
  userId: string,
  body: UpdateUserInput,
  options?: { idToken?: string | null; signal?: AbortSignal }
): Promise<ApiUser> {
  return apiRequest<ApiUser>(`/v1/users/${userId}`, {
    method: 'PATCH',
    body,
    idToken: options?.idToken,
    signal: options?.signal,
  });
}
