/**
 * Normalized API / transport errors for the AutoTrack mobile client (ATP-40).
 * Shape aligns with autotrack-api HttpErrorResponseDto when body is present.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly requestId: string | null;
  readonly body: unknown;
  readonly aborted: boolean;

  constructor(
    message: string,
    status: number,
    body?: unknown,
    options?: { code?: string | null; requestId?: string | null; aborted?: boolean }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body ?? null;
    this.code = options?.code ?? extractCode(body);
    this.requestId = options?.requestId ?? extractRequestId(body);
    this.aborted = options?.aborted ?? false;
  }
}

function extractCode(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'code' in body) {
    const code = (body as { code: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

function extractRequestId(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'requestId' in body) {
    const requestId = (body as { requestId: unknown }).requestId;
    return typeof requestId === 'string' ? requestId : null;
  }
  return null;
}

export function messageFromApiBody(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
}

/** True when the error is an expected AbortSignal cancellation. */
export function isAbortError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.aborted;
  }
  if (typeof error === 'object' && error !== null) {
    const name = 'name' in error ? String((error as { name?: unknown }).name ?? '') : '';
    const code = 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
    return name === 'CanceledError' || name === 'AbortError' || code === 'ERR_CANCELED';
  }
  return false;
}
