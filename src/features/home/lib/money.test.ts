import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COST_CENTS_MAX, parseReaisToCents } from './money';

describe('parseReaisToCents', () => {
  it('treats empty as not informed', () => {
    assert.deepEqual(parseReaisToCents(''), { ok: true, cents: undefined });
    assert.deepEqual(parseReaisToCents('   '), { ok: true, cents: undefined });
  });

  it('parses plain and BR formats', () => {
    assert.deepEqual(parseReaisToCents('150'), { ok: true, cents: 15000 });
    assert.deepEqual(parseReaisToCents('150,90'), { ok: true, cents: 15090 });
    assert.deepEqual(parseReaisToCents('1.234,56'), { ok: true, cents: 123456 });
    assert.deepEqual(parseReaisToCents('R$ 150,00'), { ok: true, cents: 15000 });
    assert.deepEqual(parseReaisToCents('150.90'), { ok: true, cents: 15090 });
  });

  it('allows zero and rejects negatives', () => {
    assert.deepEqual(parseReaisToCents('0'), { ok: true, cents: 0 });
    assert.equal(parseReaisToCents('-10').ok, false);
    assert.equal(parseReaisToCents('R$ -1,00').ok, false);
  });

  it('rejects invalid and over-limit values', () => {
    assert.equal(parseReaisToCents('abc').ok, false);
    assert.equal(parseReaisToCents(`${COST_CENTS_MAX / 100 + 1}`).ok, false);
  });
});
