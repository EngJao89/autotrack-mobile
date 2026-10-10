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

import { isFirebaseConfigured } from '@/config/env';
import { bootstrapUserProfile } from '@/services/api/auth';
import {
  getIdToken,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogleIdToken,
  signOut as authSignOut,
  type AuthCredentials,
} from '@/services/auth';
import { getFirebaseAuth } from '@/services/firebase';
import type { User } from '@/types/user';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unconfigured';

type AuthContextValue = {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  error: string | null;
  isMockProfile: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    isFirebaseConfigured() ? 'loading' : 'unconfigured'
  );
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isMockProfile, setIsMockProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      setFirebaseUser(user);
      setError(null);

      if (!user) {
        setProfile(null);
        setIsMockProfile(false);
        setStatus('unauthenticated');
        return;
      }

      try {
        const synced = await syncProfile(user);
        setProfile(synced.profile);
        setIsMockProfile(synced.mocked);
        setStatus('authenticated');
      } catch (err) {
        setProfile(null);
        setIsMockProfile(false);
        setStatus('unauthenticated');
        setError(err instanceof Error ? err.message : 'Falha ao sincronizar perfil');
        await authSignOut().catch(() => undefined);
      }
    });

    return unsubscribe;
  }, []);

  const completeAuth = useCallback(async (credentialUser: FirebaseUser) => {
    const synced = await syncProfile(credentialUser);
    setFirebaseUser(credentialUser);
    setProfile(synced.profile);
    setIsMockProfile(synced.mocked);
    setStatus('authenticated');
  }, []);

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      setError(null);
      const result = await signInWithEmail(credentials);
      await completeAuth(result.user);
    },
    [completeAuth]
  );

  const register = useCallback(
    async (credentials: AuthCredentials) => {
      setError(null);
      const result = await registerWithEmail(credentials);
      await completeAuth(result.user);
    },
    [completeAuth]
  );

  const signInWithGoogleToken = useCallback(
    async (idToken: string) => {
      setError(null);
      const result = await signInWithGoogleIdToken(idToken);
      await completeAuth(result.user);
    },
    [completeAuth]
  );

  const signOut = useCallback(async () => {
    setError(null);
    await authSignOut();
    setFirebaseUser(null);
    setProfile(null);
    setIsMockProfile(false);
    setStatus('unauthenticated');
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    const synced = await syncProfile(firebaseUser);
    setProfile(synced.profile);
    setIsMockProfile(synced.mocked);
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
      profile,
      error,
      isMockProfile,
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
      profile,
      error,
      isMockProfile,
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
