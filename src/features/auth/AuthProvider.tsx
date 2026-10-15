import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

import { getFirebaseSetupMessage, isFirebaseConfigured } from '@/config/env';
import { getFirebaseAuth } from '@/services/firebase';

import { mapFirebaseError } from './mapFirebaseError';
import { bootstrapUserProfile } from './services/bootstrapProfile';
import {
  getIdToken,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogleIdToken,
  signOut as authSignOut,
  type AuthCredentials,
} from './services/session';
import { useSessionStore, type ProfileStatus } from './store/sessionStore';
import type { User } from './types/user';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unconfigured';

type AuthContextValue = {
  /** Firebase session cycle (independent of profile bootstrap). */
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  /** Form / auth-action errors (not profile bootstrap errors). */
  error: string | null;
  /** Profile slice — also available via `useSessionStore`. */
  profile: User | null;
  profileStatus: ProfileStatus;
  profileError: string | null;
  isMockProfile: boolean;
  selectedVehicleId: string | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  signInWithGoogleToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getAccessToken: (forceRefresh?: boolean) => Promise<string | null>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncProfile(
  firebaseUser: FirebaseUser
): Promise<{ profile: User; mocked: boolean }> {
  const idToken = await getIdToken(firebaseUser);
  const profile = await bootstrapUserProfile(firebaseUser, idToken);
  const mocked = profile.id.startsWith('mock-');
  return { profile, mocked };
}

async function loadSessionProfile(firebaseUser: FirebaseUser): Promise<void> {
  const identityKey = firebaseUser.uid;
  const requestId = useSessionStore.getState().beginProfileLoad(identityKey);

  try {
    const synced = await syncProfile(firebaseUser);
    useSessionStore
      .getState()
      .setProfileReady(requestId, identityKey, synced.profile, synced.mocked);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao sincronizar perfil';
    useSessionStore.getState().setProfileError(requestId, identityKey, message);
    // Policy (ATP-3): profile sync failure does NOT revoke Firebase authentication.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    isFirebaseConfigured() ? 'loading' : 'unconfigured'
  );
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profile = useSessionStore((s) => s.profile);
  const profileStatus = useSessionStore((s) => s.profileStatus);
  const profileError = useSessionStore((s) => s.profileError);
  const isMockProfile = useSessionStore((s) => s.isMockProfile);
  const selectedVehicleId = useSessionStore((s) => s.selectedVehicleId);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      setError(null);

      if (!user) {
        useSessionStore.getState().clearSessionClientState();
        setFirebaseUser(null);
        setStatus('unauthenticated');
        return;
      }

      const previousIdentity = useSessionStore.getState().identityKey;
      if (previousIdentity && previousIdentity !== user.uid) {
        useSessionStore.getState().clearSessionClientState();
      }

      setFirebaseUser(user);
      setStatus('authenticated');
      await loadSessionProfile(user);
    });

    return unsubscribe;
  }, []);

  const completeAuth = useCallback(async (credentialUser: FirebaseUser) => {
    const previousIdentity = useSessionStore.getState().identityKey;
    if (previousIdentity && previousIdentity !== credentialUser.uid) {
      useSessionStore.getState().clearSessionClientState();
    }

    setFirebaseUser(credentialUser);
    setStatus('authenticated');
    await loadSessionProfile(credentialUser);
  }, []);

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      setError(null);
      if (!isFirebaseConfigured()) {
        throw new Error(getFirebaseSetupMessage());
      }
      try {
        const result = await signInWithEmail(credentials);
        await completeAuth(result.user);
      } catch (err) {
        const message = mapFirebaseError(err);
        setError(message);
        throw new Error(message);
      }
    },
    [completeAuth]
  );

  const register = useCallback(
    async (credentials: AuthCredentials) => {
      setError(null);
      if (!isFirebaseConfigured()) {
        throw new Error(getFirebaseSetupMessage());
      }
      try {
        const result = await registerWithEmail(credentials);
        await completeAuth(result.user);
      } catch (err) {
        const message = mapFirebaseError(err);
        setError(message);
        throw new Error(message);
      }
    },
    [completeAuth]
  );

  const signInWithGoogleToken = useCallback(
    async (idToken: string) => {
      setError(null);
      if (!isFirebaseConfigured()) {
        throw new Error(getFirebaseSetupMessage());
      }
      try {
        const result = await signInWithGoogleIdToken(idToken);
        await completeAuth(result.user);
      } catch (err) {
        const message = mapFirebaseError(err);
        setError(message);
        throw new Error(message);
      }
    },
    [completeAuth]
  );

  const signOut = useCallback(async () => {
    setError(null);
    useSessionStore.getState().clearSessionClientState();
    await authSignOut();
    setFirebaseUser(null);
    setStatus('unauthenticated');
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    useSessionStore.getState().invalidateProfile();
    await loadSessionProfile(firebaseUser);
  }, [firebaseUser]);

  const getAccessToken = useCallback(
    async (forceRefresh = false) => {
      if (!firebaseUser) return null;
      return getIdToken(firebaseUser, forceRefresh);
    },
    [firebaseUser]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      firebaseUser,
      error,
      profile,
      profileStatus,
      profileError,
      isMockProfile,
      selectedVehicleId,
      signIn,
      register,
      signInWithGoogleToken,
      signOut,
      refreshProfile,
      getAccessToken,
      clearError: () => setError(null),
    }),
    [
      status,
      firebaseUser,
      error,
      profile,
      profileStatus,
      profileError,
      isMockProfile,
      selectedVehicleId,
      signIn,
      register,
      signInWithGoogleToken,
      signOut,
      refreshProfile,
      getAccessToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
