import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { allowedEstimateTransitions, canEditEstimateContent } from './status';

describe('estimate status helpers', () => {
  it('exposes allowed transitions', () => {
    assert.deepEqual(allowedEstimateTransitions('DRAFT'), ['FINALIZED', 'ARCHIVED']);
    assert.deepEqual(allowedEstimateTransitions('FINALIZED'), ['DRAFT', 'ARCHIVED']);
    assert.deepEqual(allowedEstimateTransitions('ARCHIVED'), []);
  });

  it('allows content edit only in DRAFT', () => {
    assert.equal(canEditEstimateContent('DRAFT'), true);
    assert.equal(canEditEstimateContent('FINALIZED'), false);
    assert.equal(canEditEstimateContent('ARCHIVED'), false);
  });
});
