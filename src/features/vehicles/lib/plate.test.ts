import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatLicensePlate, normalizeLicensePlate } from './plate';

describe('normalizeLicensePlate', () => {
  it('trims and uppercases', () => {
    assert.equal(normalizeLicensePlate('  abc1d23  '), 'ABC1D23');
  });

  it('returns undefined for empty', () => {
    assert.equal(normalizeLicensePlate(''), undefined);
    assert.equal(normalizeLicensePlate('   '), undefined);
    assert.equal(normalizeLicensePlate(null), undefined);
  });

  it('caps at 10 characters', () => {
    assert.equal(normalizeLicensePlate('ABCDEFGHIJK'), 'ABCDEFGHIJ');
  });
});

describe('formatLicensePlate', () => {
  it('shows dash when missing', () => {
    assert.equal(formatLicensePlate(null), '—');
  });
});
