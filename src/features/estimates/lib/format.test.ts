import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { categoryLabel, estimateStatusLabel, formatCentsBRL } from './format';

describe('estimate format helpers', () => {
  it('formats cents as BRL', () => {
    const formatted = formatCentsBRL(18990);
    assert.match(formatted, /189[,.]90/);
  });

  it('labels statuses and categories', () => {
    assert.equal(estimateStatusLabel('DRAFT'), 'Rascunho');
    assert.equal(estimateStatusLabel('FINALIZED'), 'Finalizado');
    assert.equal(estimateStatusLabel('ARCHIVED'), 'Arquivado');
    assert.equal(categoryLabel('PART'), 'Peça');
    assert.equal(categoryLabel('LABOR'), 'Mão de obra');
  });
});
