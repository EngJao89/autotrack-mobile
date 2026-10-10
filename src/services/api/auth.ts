import type { User as FirebaseUser } from 'firebase/auth';

import { env } from '@/config/env';
import type { User } from '@/types/user';

import { ApiError, apiRequest } from './client';

/**
 * Creates or returns the authenticated local profile.
 * Contract aligned with autotrack-api (ATP-30): Bearer Firebase ID token.
 * Prefer POST /v1/auth/bootstrap; fallback GET /v1/users/me.
 */
export async function bootstrapUserProfile(
  firebaseUser: FirebaseUser,
  idToken: string
): Promise<User> {
  try {
    return await apiRequest<User>('/v1/auth/bootstrap', {
      method: 'POST',
      idToken,
      body: {},
    });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      return apiRequest<User>('/v1/users/me', { method: 'GET', idToken });
    }

    if (env.apiMock && shouldUseMock(error)) {
      return createMockProfile(firebaseUser);
    }

    throw error;
  }
}

function shouldUseMock(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true;
  }
  // Network / not configured / API still being built
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
