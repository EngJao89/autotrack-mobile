import { useEffect, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env, getGoogleConfigHint, isGoogleConfigured } from '@/config/env';
import { getGooglePlatformHint } from '@/services/auth';

import { useAuth } from './AuthProvider';

WebBrowser.maybeCompleteAuthSession();

/**
 * Placeholder so AuthSession hooks can mount before .env is filled.
 * promptAsync is never called while `ready` is false.
 */
const UNCONFIGURED_CLIENT_ID = 'unconfigured.apps.googleusercontent.com';

export function useGoogleSignIn() {
  const { signInWithGoogleToken } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handledResponse = useRef<string | null>(null);
  const configured = isGoogleConfigured();

  const webClientId = env.google.webClientId || UNCONFIGURED_CLIENT_ID;
  const iosClientId = env.google.iosClientId || env.google.webClientId || UNCONFIGURED_CLIENT_ID;
  const androidClientId =
    env.google.androidClientId || env.google.webClientId || UNCONFIGURED_CLIENT_ID;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    iosClientId,
    androidClientId,
  });

  useEffect(() => {
    if (!configured || response?.type !== 'success') {
      return;
    }

    const responseKey = JSON.stringify(response.params);
    if (handledResponse.current === responseKey) {
      return;
    }
    handledResponse.current = responseKey;

    const idToken = response.params.id_token;
    if (!idToken) {
      queueMicrotask(() => setError('Google não retornou id_token.'));
      return;
    }

    queueMicrotask(() => setPending(true));
    signInWithGoogleToken(idToken)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Falha no login Google');
      })
      .finally(() => setPending(false));
  }, [configured, response, signInWithGoogleToken]);

  async function promptGoogleSignIn() {
    setError(null);

    if (!configured) {
      setError(getGoogleConfigHint());
      return;
    }

    setPending(true);
    try {
      await promptAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao abrir Google Sign-In');
    } finally {
      setPending(false);
    }
  }

  const platformHint =
    Platform.OS === 'android' && configured && !env.google.androidClientId
      ? 'Usando WEB client ID no Android. Para produção, prefira EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.'
      : getGooglePlatformHint();

  return {
    ready: configured && Boolean(request),
    pending,
    error,
    hint: configured ? platformHint : `${getGoogleConfigHint()} ${getGooglePlatformHint()}`,
    promptGoogleSignIn,
  };
}
