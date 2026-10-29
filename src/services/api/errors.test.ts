import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError, isAbortError, messageFromApiBody } from './errors';

describe('ApiError', () => {
  it('extracts code and requestId from API body', () => {
    const error = new ApiError('not found', 404, {
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'not found',
      requestId: 'req-1',
    });

    assert.equal(error.status, 404);
    assert.equal(error.code, 'NOT_FOUND');
    assert.equal(error.requestId, 'req-1');
    assert.equal(error.aborted, false);
  });
});

describe('messageFromApiBody', () => {
  it('prefers message from body', () => {
    assert.equal(messageFromApiBody({ message: 'boom' }, 'fallback'), 'boom');
  });

  it('falls back when message missing', () => {
    assert.equal(messageFromApiBody({ code: 'X' }, 'fallback'), 'fallback');
  });
});

describe('isAbortError', () => {
  it('detects ApiError aborted flag', () => {
    assert.equal(isAbortError(new ApiError('x', 0, null, { aborted: true })), true);
  });

  it('detects axios CanceledError shape', () => {
    assert.equal(isAbortError({ name: 'CanceledError', code: 'ERR_CANCELED' }), true);
  });

  it('returns false for regular errors', () => {
    assert.equal(isAbortError(new Error('network')), false);
  });
});
