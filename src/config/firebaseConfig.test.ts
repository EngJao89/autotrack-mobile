import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  looksLikePrivateKey,
  looksLikeWebApiKey,
  validateFirebaseClientConfig,
} from './firebaseConfig';

describe('firebaseConfig validation', () => {
  it('accepts a valid Web client config', () => {
    const issues = validateFirebaseClientConfig({
      apiKey: 'AIzaSyDummyTestKeyValue123456789012',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '1234567890',
      appId: '1:1234567890:web:abcdef123456',
    });
    assert.equal(issues.length, 0);
  });

  it('rejects private keys in apiKey', () => {
    assert.equal(
      looksLikePrivateKey('-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----'),
      true
    );
    const issues = validateFirebaseClientConfig({
      apiKey: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '123',
      appId: '1:123:web:abc',
    });
    assert.equal(
      issues.some((i) => i.code === 'private_key_in_client'),
      true
    );
  });

  it('rejects invalid api key shape', () => {
    assert.equal(looksLikeWebApiKey('not-a-key'), false);
    const issues = validateFirebaseClientConfig({
      apiKey: 'invalid',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '123',
      appId: '1:123:web:abc',
    });
    assert.equal(
      issues.some((i) => i.code === 'invalid_api_key_shape'),
      true
    );
  });

  it('rejects missing config', () => {
    const issues = validateFirebaseClientConfig({});
    assert.ok(issues.length >= 3);
  });
});
