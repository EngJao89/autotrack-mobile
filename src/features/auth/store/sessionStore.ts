import { create } from 'zustand';

import type { User } from '../types/user';

/**
 * Shared client state for the authenticated session (ATP-3 PoC).
 *
 * Owns: profile bootstrap status, last profile snapshot, selected vehicle id.
 * Does NOT own: Firebase Auth cycle, passwords, or tokens (those stay in AuthProvider / getIdToken).
 * Does NOT persist: private data is memory-only and cleared on logout / identity change.
 */

export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

type SessionClientState = {
  /** Firebase uid of the session this slice belongs to. */
  identityKey: string | null;
  profileStatus: ProfileStatus;
  profile: User | null;
  profileError: string | null;
  isMockProfile: boolean;
  /** Placeholder for domain selection — must clear on logout / identity switch. */
  selectedVehicleId: string | null;
  /** Bumps on every load/clear so stale async results are ignored. */
  profileRequestId: number;

  beginProfileLoad: (identityKey: string) => number;
  setProfileReady: (requestId: number, identityKey: string, profile: User, isMock: boolean) => void;
  setProfileError: (requestId: number, identityKey: string, message: string) => void;
  invalidateProfile: () => void;
  setSelectedVehicleId: (vehicleId: string | null) => void;
  clearSessionClientState: () => void;
};

function createIdleSlice(
  profileRequestId: number
): Omit<
  SessionClientState,
  | 'beginProfileLoad'
  | 'setProfileReady'
  | 'setProfileError'
  | 'invalidateProfile'
  | 'setSelectedVehicleId'
  | 'clearSessionClientState'
> {
  return {
    identityKey: null,
    profileStatus: 'idle',
    profile: null,
    profileError: null,
    isMockProfile: false,
    selectedVehicleId: null,
    profileRequestId,
  };
}

export const useSessionStore = create<SessionClientState>((set, get) => ({
  ...createIdleSlice(0),

  beginProfileLoad: (identityKey) => {
    const prev = get();
    const sameIdentity = prev.identityKey === identityKey;
    const requestId = prev.profileRequestId + 1;

    set({
      identityKey,
      profileRequestId: requestId,
      profileStatus: 'loading',
      profileError: null,
      profile: sameIdentity ? prev.profile : null,
      isMockProfile: sameIdentity ? prev.isMockProfile : false,
      selectedVehicleId: sameIdentity ? prev.selectedVehicleId : null,
    });

    return requestId;
  },

  setProfileReady: (requestId, identityKey, profile, isMock) => {
    const state = get();
    if (requestId !== state.profileRequestId || state.identityKey !== identityKey) {
      return;
    }
    set({
      profileStatus: 'ready',
      profile,
      isMockProfile: isMock,
      profileError: null,
    });
  },

  setProfileError: (requestId, identityKey, message) => {
    const state = get();
    if (requestId !== state.profileRequestId || state.identityKey !== identityKey) {
      return;
    }
    set({
      profileStatus: 'error',
      profile: null,
      isMockProfile: false,
      profileError: message,
    });
  },

  invalidateProfile: () => {
    const { identityKey, profileRequestId } = get();
    if (!identityKey) {
      return;
    }
    set({
      profileStatus: 'idle',
      profile: null,
      isMockProfile: false,
      profileError: null,
      profileRequestId: profileRequestId + 1,
    });
  },

  setSelectedVehicleId: (vehicleId) => set({ selectedVehicleId: vehicleId }),

  clearSessionClientState: () => {
    set(createIdleSlice(get().profileRequestId + 1));
  },
}));
