import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { User } from '../types/user';
import { useSessionStore } from './sessionStore';

function mockUser(uid: string, email = `${uid}@example.com`): User {
  const now = new Date().toISOString();
  return {
    id: `user-${uid}`,
    firebaseUid: uid,
    email,
    name: `User ${uid}`,
    cnh: null,
    document: null,
    documentType: null,
    phone: null,
    createdAt: now,
    updatedAt: now,
    vehicles: [],
  };
}

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSessionClientState();
  });

  it('loads profile to ready for an identity', () => {
    const store = useSessionStore.getState();
    const requestId = store.beginProfileLoad('uid-a');
    store.setProfileReady(requestId, 'uid-a', mockUser('uid-a'), false);

    const state = useSessionStore.getState();
    assert.equal(state.profileStatus, 'ready');
    assert.equal(state.profile?.firebaseUid, 'uid-a');
    assert.equal(state.isMockProfile, false);
    assert.equal(state.profileError, null);
  });

  it('records profile error without clearing identityKey', () => {
    const store = useSessionStore.getState();
    const requestId = store.beginProfileLoad('uid-a');
    store.setProfileError(requestId, 'uid-a', 'API unavailable');

    const state = useSessionStore.getState();
    assert.equal(state.profileStatus, 'error');
    assert.equal(state.identityKey, 'uid-a');
    assert.equal(state.profile, null);
    assert.match(state.profileError ?? '', /API unavailable/);
  });

  it('ignores stale async results after a newer load', () => {
    const store = useSessionStore.getState();
    const staleId = store.beginProfileLoad('uid-a');
    const freshId = store.beginProfileLoad('uid-a');

    store.setProfileReady(staleId, 'uid-a', mockUser('uid-a', 'stale@example.com'), true);
    assert.equal(useSessionStore.getState().profileStatus, 'loading');
    assert.equal(useSessionStore.getState().profile, null);

    store.setProfileReady(freshId, 'uid-a', mockUser('uid-a', 'fresh@example.com'), false);
    assert.equal(useSessionStore.getState().profile?.email, 'fresh@example.com');
    assert.equal(useSessionStore.getState().isMockProfile, false);
  });

  it('clears private data on logout (clearSessionClientState)', () => {
    const store = useSessionStore.getState();
    const requestId = store.beginProfileLoad('uid-a');
    store.setProfileReady(requestId, 'uid-a', mockUser('uid-a'), true);
    store.setSelectedVehicleId('vehicle-1');

    store.clearSessionClientState();

    const state = useSessionStore.getState();
    assert.equal(state.identityKey, null);
    assert.equal(state.profileStatus, 'idle');
    assert.equal(state.profile, null);
    assert.equal(state.isMockProfile, false);
    assert.equal(state.selectedVehicleId, null);
    assert.equal(state.profileError, null);
  });

  it('does not let previous session data fill a new identity', () => {
    const store = useSessionStore.getState();
    const firstId = store.beginProfileLoad('uid-a');
    store.setProfileReady(firstId, 'uid-a', mockUser('uid-a'), false);
    store.setSelectedVehicleId('vehicle-a');

    const secondId = store.beginProfileLoad('uid-b');
    assert.equal(useSessionStore.getState().identityKey, 'uid-b');
    assert.equal(useSessionStore.getState().profile, null);
    assert.equal(useSessionStore.getState().selectedVehicleId, null);
    assert.equal(useSessionStore.getState().profileStatus, 'loading');

    // Late response from previous user must be ignored
    store.setProfileReady(firstId, 'uid-a', mockUser('uid-a'), false);
    assert.equal(useSessionStore.getState().profile, null);
    assert.equal(useSessionStore.getState().identityKey, 'uid-b');

    store.setProfileReady(secondId, 'uid-b', mockUser('uid-b'), true);
    assert.equal(useSessionStore.getState().profile?.firebaseUid, 'uid-b');
    assert.equal(useSessionStore.getState().isMockProfile, true);
  });

  it('invalidateProfile drops in-flight results and clears snapshot', () => {
    const store = useSessionStore.getState();
    const requestId = store.beginProfileLoad('uid-a');
    store.setProfileReady(requestId, 'uid-a', mockUser('uid-a'), false);

    store.invalidateProfile();
    assert.equal(useSessionStore.getState().profileStatus, 'idle');
    assert.equal(useSessionStore.getState().profile, null);
    assert.equal(useSessionStore.getState().identityKey, 'uid-a');

    store.setProfileReady(requestId, 'uid-a', mockUser('uid-a'), true);
    assert.equal(useSessionStore.getState().profile, null);
  });
});
