import {
  AxiosHeaders,
  create,
  isAxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/config/env';

import { ApiError, isAbortError, messageFromApiBody } from './errors';
import { getCurrentIdToken } from './token';

const DEFAULT_TIMEOUT_MS = 30_000;

type AuthExtras = {
  /** Skip Bearer attachment (public routes like health). */
  skipAuth?: boolean;
  /** Explicit Firebase ID Token; overrides currentUser lookup. */
  idToken?: string | null;
  /** Internal: already attempted a forced token refresh for this request. */
  _retryAfterRefresh?: boolean;
};

type AuthRequestConfig = InternalAxiosRequestConfig & AuthExtras;
type AuthAxiosRequestConfig = AxiosRequestConfig & AuthExtras;

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Firebase ID token — pass per request or let the client read currentUser. */
  idToken?: string | null;
  /** When true, do not attach Authorization (public endpoints). */
  skipAuth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};

let sharedClient: AxiosInstance | null = null;
let refreshInFlight: Promise<string | null> | null = null;

/** Pending requests registered for logout / identity-switch cancellation. */
const pendingControllers = new Set<AbortController>();

function resolveBaseUrl(): string {
  return env.apiUrl.replace(/\/$/, '');
}

function resolveTimeoutMs(override?: number): number {
  if (typeof override === 'number' && Number.isFinite(override) && override > 0) {
    return override;
  }
  return env.apiTimeoutMs > 0 ? env.apiTimeoutMs : DEFAULT_TIMEOUT_MS;
}

async function resolveBearerToken(config: AuthExtras): Promise<string | null> {
  if (config.skipAuth) {
    return null;
  }
  if (config.idToken !== undefined) {
    return config.idToken;
  }
  return getCurrentIdToken(false);
}

function setAuthorizationHeader(config: AuthRequestConfig, token: string | null): void {
  const headers = AxiosHeaders.from(config.headers ?? {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.delete('Authorization');
  }
  config.headers = headers;
}

async function refreshIdTokenOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = getCurrentIdToken(true).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAbortError(error)) {
    return new ApiError('Requisição cancelada.', 0, null, { aborted: true, code: 'ABORTED' });
  }

  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError('Tempo esgotado ao falar com a API.', 0, null, { code: 'TIMEOUT' });
    }

    if (!error.response) {
      return new ApiError('Falha de rede ao falar com a API.', 0, null, { code: 'NETWORK' });
    }

    const status = error.response.status;
    const body = error.response.data;
    return new ApiError(messageFromApiBody(body, `Falha na API (${status})`), status, body);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0, null, { code: 'UNKNOWN' });
  }

  return new ApiError('Falha desconhecida na API.', 0, null, { code: 'UNKNOWN' });
}

function createClient(): AxiosInstance {
  if (!env.apiUrl) {
    throw new ApiError(
      'EXPO_PUBLIC_API_URL não configurada. Defina a URL da autotrack-api ou use o modo mock.',
      0,
      null,
      { code: 'API_URL_MISSING' }
    );
  }

  const instance = create({
    baseURL: resolveBaseUrl(),
    timeout: resolveTimeoutMs(),
    headers: {
      Accept: 'application/json',
    },
    // React Native / Expo: default adapter is fine (XHR).
    validateStatus: (status) => status >= 200 && status < 300,
  });

  instance.interceptors.request.use(async (config) => {
    const authConfig = config as AuthRequestConfig;
    const token = await resolveBearerToken(authConfig);
    setAuthorizationHeader(authConfig, token);

    if (authConfig.data !== undefined && authConfig.data !== null) {
      const headers = AxiosHeaders.from(authConfig.headers ?? {});
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      authConfig.headers = headers;
    }

    return authConfig;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(toApiError(error));
      }

      const original = error.config as AuthRequestConfig;
      const status = error.response?.status;

      if (
        status === 401 &&
        !original.skipAuth &&
        !original._retryAfterRefresh &&
        original.method?.toLowerCase() !== undefined
      ) {
        original._retryAfterRefresh = true;
        const refreshed = await refreshIdTokenOnce();
        if (refreshed) {
          setAuthorizationHeader(original, refreshed);
          original.idToken = refreshed;
          return instance.request(original);
        }
      }

      return Promise.reject(toApiError(error));
    }
  );

  return instance;
}

/** Shared Axios instance for autotrack-api. Lazily created from `EXPO_PUBLIC_API_URL`. */
export function getApiClient(): AxiosInstance {
  if (!sharedClient) {
    sharedClient = createClient();
  }
  return sharedClient;
}

/** Test helper — resets the singleton (does not cancel in-flight requests). */
export function resetApiClientForTests(): void {
  sharedClient = null;
  refreshInFlight = null;
}

/**
 * Abort all in-flight requests registered via `apiRequest`.
 * Call on logout / Firebase identity switch so stale responses cannot apply.
 */
export function cancelPendingApiRequests(): void {
  for (const controller of pendingControllers) {
    controller.abort();
  }
  pendingControllers.clear();
}

/**
 * Typed HTTP helper over the shared Axios client.
 * Paths must include the API version prefix (e.g. `/v1/health`) — do not put `/v1` in baseURL.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const localController = new AbortController();
  pendingControllers.add(localController);

  const onExternalAbort = () => localController.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      localController.abort();
    } else {
      options.signal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  try {
    if (localController.signal.aborted) {
      throw new ApiError('Requisição cancelada.', 0, null, { aborted: true, code: 'ABORTED' });
    }

    const client = getApiClient();
    const timeout = resolveTimeoutMs(options.timeoutMs);

    const config: AuthAxiosRequestConfig = {
      url: path.startsWith('/') ? path : `/${path}`,
      method: options.method ?? 'GET',
      data: options.body,
      timeout,
      signal: localController.signal,
      skipAuth: options.skipAuth,
      idToken: options.idToken,
    };

    const response = await client.request<T>(config);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  } finally {
    pendingControllers.delete(localController);
    options.signal?.removeEventListener('abort', onExternalAbort);
  }
}

export { ApiError, isAbortError } from './errors';
