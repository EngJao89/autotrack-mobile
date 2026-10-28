import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapFirebaseError } from './mapFirebaseError';

describe('mapFirebaseError', () => {
  it('maps invalid api key codes to a friendly message', () => {
    const message = mapFirebaseError({
      code: 'auth/api-key-not-valid.-please-pass-a-valid-api-key.',
      message: 'Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)',
    });
    assert.match(message, /API key/i);
    assert.doesNotMatch(message, /BEGIN PRIVATE/i);
  });

  it('maps email already in use', () => {
    assert.match(mapFirebaseError({ code: 'auth/email-already-in-use' }), /já está cadastrado/i);
  });

  it('maps invalid credentials', () => {
    assert.match(mapFirebaseError({ code: 'auth/invalid-credential' }), /incorretos/i);
  });

  it('maps configuration-not-found', () => {
    assert.match(
      mapFirebaseError({ code: 'auth/configuration-not-found' }),
      /Sign-in method|E-mail\/senha/i
    );
  });

  it('maps expired action code for password recovery', () => {
    assert.match(mapFirebaseError({ code: 'auth/expired-action-code' }), /recuperação|expirado/i);
  });
});
