import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emailPasswordSchema, forgotPasswordSchema, registerSchema } from './schemas';

describe('auth schemas', () => {
  it('rejects short passwords on login', () => {
    const result = emailPasswordSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });
    assert.equal(result.success, false);
  });

  it('requires matching confirmation on register', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'password1',
      confirmPassword: 'password2',
    });
    assert.equal(result.success, false);
  });

  it('accepts valid forgot-password e-mail', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    assert.equal(result.success, true);
  });
});
