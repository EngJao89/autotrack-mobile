import type { User as FirebaseUser } from 'firebase/auth';

import { env } from '@/config/env';
import { ApiError, apiRequest } from '@/services/api/client';
import type { ApiUser, BootstrapResponse } from '@/services/api/types';

import type { User } from '../types/user';

/**
 * Creates or returns the authenticated local profile.
 * Contract aligned with autotrack-api (ATP-30 / OpenAPI): Bearer Firebase ID token.
 * Prefer POST /v1/auth/bootstrap; fallback GET /v1/users/me.
 *
 * Mock adapter is explicit when EXPO_PUBLIC_API_MOCK=true — not a real API integration.
 */
export async function bootstrapUserProfile(
  firebaseUser: FirebaseUser,
  idToken: string
): Promise<User> {
  try {
    const response = await apiRequest<BootstrapResponse>('/v1/auth/bootstrap', {
      method: 'POST',
      idToken,
    });
    return mapApiUserToProfile(response.user, firebaseUser);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      const me = await apiRequest<ApiUser>('/v1/users/me', { method: 'GET', idToken });
      return mapApiUserToProfile(me, firebaseUser);
    }

    if (env.apiMock && shouldUseMock(error)) {
      return createMockProfile(firebaseUser);
    }

    throw error;
  }
}

function mapApiUserToProfile(apiUser: ApiUser, firebaseUser: FirebaseUser): User {
  return {
    id: apiUser.id,
    firebaseUid: apiUser.firebaseUid ?? firebaseUser.uid,
    email: apiUser.email,
    name: apiUser.name,
    cnh: apiUser.cnh,
    document: apiUser.document,
    documentType: apiUser.documentType,
    phone: apiUser.phone,
    createdAt:
      typeof apiUser.createdAt === 'string'
        ? apiUser.createdAt
        : new Date(apiUser.createdAt).toISOString(),
    updatedAt:
      typeof apiUser.updatedAt === 'string'
        ? apiUser.updatedAt
        : new Date(apiUser.updatedAt).toISOString(),
    vehicles: [],
  };
}

function shouldUseMock(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true;
  }
  // Network / not configured / API still being built — never silent success without mock flag.
  return error.status === 0 || error.status >= 500 || error.status === 404;
}

function createMockProfile(firebaseUser: FirebaseUser): User {
  const now = new Date().toISOString();
  return {
    id: `mock-${firebaseUser.uid}`,
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    name: firebaseUser.displayName,
    cnh: null,
    document: null,
    documentType: null,
    phone: firebaseUser.phoneNumber,
    createdAt: now,
    updatedAt: now,
    vehicles: [],
  };
}
