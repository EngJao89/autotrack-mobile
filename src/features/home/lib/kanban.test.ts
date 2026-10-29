import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Maintenance } from '@/services/api';

import { canTransition, countByStatus, groupByStatus, normalizeStatus, sortColumn } from './kanban';

function item(
  partial: Partial<Maintenance> & Pick<Maintenance, 'id' | 'status' | 'serviceDate'>
): Maintenance {
  return {
    vehicleId: 'v1',
    type: 'Revisão',
    description: null,
    odometerKm: null,
    costCents: null,
    workshopName: null,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('normalizeStatus', () => {
  it('keeps known statuses', () => {
    assert.equal(normalizeStatus('TODO'), 'TODO');
    assert.equal(normalizeStatus('IN_PROGRESS'), 'IN_PROGRESS');
    assert.equal(normalizeStatus('DONE'), 'DONE');
  });

  it('maps missing/unknown historical status to DONE (not pending)', () => {
    assert.equal(normalizeStatus(undefined), 'DONE');
    assert.equal(normalizeStatus('LEGACY'), 'DONE');
  });
});

describe('countByStatus / groupByStatus', () => {
  const items = [
    item({ id: '1', status: 'TODO', serviceDate: '2026-11-02T00:00:00.000Z' }),
    item({ id: '2', status: 'TODO', serviceDate: '2026-11-01T00:00:00.000Z' }),
    item({ id: '3', status: 'IN_PROGRESS', serviceDate: '2026-10-20T00:00:00.000Z' }),
    item({ id: '4', status: 'DONE', serviceDate: '2026-09-01T00:00:00.000Z' }),
    item({ id: '5', status: 'DONE', serviceDate: '2026-10-01T00:00:00.000Z' }),
  ];

  it('counts each column from the full list', () => {
    assert.deepEqual(countByStatus(items), { TODO: 2, IN_PROGRESS: 1, DONE: 2 });
  });

  it('groups and sorts open columns by planned date ascending', () => {
    const groups = groupByStatus(items);
    assert.deepEqual(
      groups.TODO.map((m) => m.id),
      ['2', '1']
    );
  });

  it('sorts DONE by serviceDate descending', () => {
    const done = sortColumn(
      items.filter((m) => m.status === 'DONE'),
      'DONE'
    );
    assert.deepEqual(
      done.map((m) => m.id),
      ['5', '4']
    );
  });
});

describe('transitions', () => {
  it('allows TODO → IN_PROGRESS / DONE', () => {
    assert.equal(canTransition('TODO', 'IN_PROGRESS'), true);
    assert.equal(canTransition('TODO', 'DONE'), true);
  });

  it('blocks reopen from DONE', () => {
    assert.equal(canTransition('DONE', 'TODO'), false);
    assert.equal(canTransition('DONE', 'IN_PROGRESS'), false);
  });
});
