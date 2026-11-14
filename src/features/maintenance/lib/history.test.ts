import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Maintenance, Vehicle } from '@/services/api';

import {
  buildMaintenanceHistory,
  formatMaintenanceCost,
  formatMaintenanceDate,
  formatMaintenanceOdometer,
  formatMaintenanceVehicleLabel,
  isCompletedMaintenance,
  maintenanceServiceTitle,
  normalizeMaintenanceStatus,
  sortCompletedMaintenances,
  toMaintenanceHistoryCard,
} from './history';

function maintenance(partial: Partial<Maintenance> & Pick<Maintenance, 'id'>): Maintenance {
  return {
    vehicleId: 'veh-1',
    type: 'Preventiva',
    status: 'DONE',
    description: null,
    serviceDate: '2026-01-15T12:00:00.000Z',
    odometerKm: null,
    costCents: null,
    workshopName: null,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

const vehicle: Vehicle = {
  id: 'veh-1',
  userId: 'user-1',
  brand: 'Fiat',
  model: 'Argo',
  version: null,
  year: 2022,
  licensePlate: 'ABC1D23',
  color: null,
  fuelType: null,
  odometerKm: 10000,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('normalizeMaintenanceStatus / isCompletedMaintenance', () => {
  it('treats only DONE as completed', () => {
    assert.equal(isCompletedMaintenance({ status: 'DONE' }), true);
    assert.equal(isCompletedMaintenance({ status: 'TODO' }), false);
    assert.equal(isCompletedMaintenance({ status: 'IN_PROGRESS' }), false);
  });

  it('maps missing/unknown status to DONE (historical)', () => {
    assert.equal(normalizeMaintenanceStatus(undefined), 'DONE');
    assert.equal(normalizeMaintenanceStatus('LEGACY'), 'DONE');
    assert.equal(isCompletedMaintenance({ status: 'LEGACY' as Maintenance['status'] }), true);
  });
});

describe('maintenanceServiceTitle', () => {
  it('prefers description, falls back to type', () => {
    assert.equal(
      maintenanceServiceTitle({ description: 'Troca de óleo', type: 'Preventiva' }),
      'Troca de óleo'
    );
    assert.equal(maintenanceServiceTitle({ description: '  ', type: 'Freios' }), 'Freios');
    assert.equal(maintenanceServiceTitle({ description: null, type: 'Pneus' }), 'Pneus');
  });
});

describe('formatters', () => {
  it('formats date, odometer and cost without inventing values', () => {
    assert.equal(formatMaintenanceDate('2026-03-10T15:00:00.000Z'), '10/03/2026');
    assert.equal(formatMaintenanceDate(null), null);
    assert.equal(formatMaintenanceDate('not-a-date'), null);

    assert.equal(formatMaintenanceOdometer(12345), '12.345 km');
    assert.equal(formatMaintenanceOdometer(null), null);

    assert.equal(formatMaintenanceCost(15090), 'R$\u00a0150,90');
    assert.equal(formatMaintenanceCost(0), 'R$\u00a00,00');
    assert.equal(formatMaintenanceCost(null), null);
  });

  it('formats vehicle label or Não informado', () => {
    assert.equal(formatMaintenanceVehicleLabel(vehicle), 'Fiat Argo · 2022');
    assert.equal(formatMaintenanceVehicleLabel(undefined), 'Não informado');
  });
});

describe('buildMaintenanceHistory', () => {
  it('keeps only completed, sorts newest first, dedupes by id', () => {
    const items = [
      maintenance({ id: 'a', status: 'TODO', serviceDate: '2026-05-01T00:00:00.000Z' }),
      maintenance({ id: 'b', status: 'DONE', serviceDate: '2026-02-01T00:00:00.000Z' }),
      maintenance({ id: 'c', status: 'DONE', serviceDate: '2026-04-01T00:00:00.000Z' }),
      maintenance({ id: 'b', status: 'DONE', serviceDate: '2026-02-01T00:00:00.000Z' }),
      maintenance({ id: 'd', status: 'IN_PROGRESS', serviceDate: '2026-06-01T00:00:00.000Z' }),
    ];

    const history = buildMaintenanceHistory(items);
    assert.deepEqual(
      history.map((m) => m.id),
      ['c', 'b']
    );
  });

  it('uses stable id tie-break when serviceDate matches', () => {
    const items = [
      maintenance({ id: 'z', serviceDate: '2026-01-01T00:00:00.000Z' }),
      maintenance({ id: 'a', serviceDate: '2026-01-01T00:00:00.000Z' }),
    ];
    assert.deepEqual(
      sortCompletedMaintenances(items).map((m) => m.id),
      ['a', 'z']
    );
  });

  it('returns empty list when there are no completed items', () => {
    assert.deepEqual(
      buildMaintenanceHistory([
        maintenance({ id: 'x', status: 'TODO' }),
        maintenance({ id: 'y', status: 'IN_PROGRESS' }),
      ]),
      []
    );
  });
});

describe('toMaintenanceHistoryCard', () => {
  it('maps available fields and omits absent optionals', () => {
    const card = toMaintenanceHistoryCard(
      maintenance({
        id: 'm1',
        description: 'Alinhamento',
        serviceDate: '2026-02-20T12:00:00.000Z',
        odometerKm: 5000,
        costCents: 25000,
      }),
      vehicle
    );

    assert.equal(card.title, 'Alinhamento');
    assert.equal(card.vehicleLabel, 'Fiat Argo · 2022');
    assert.equal(card.serviceDate, '20/02/2026');
    assert.equal(card.odometer, '5.000 km');
    assert.equal(card.cost, 'R$\u00a0250,00');
  });

  it('omits optional lines when data is null', () => {
    const card = toMaintenanceHistoryCard(
      maintenance({
        id: 'm2',
        description: null,
        type: 'Outro',
        odometerKm: null,
        costCents: null,
        serviceDate: 'invalid',
      }),
      undefined
    );

    assert.equal(card.title, 'Outro');
    assert.equal(card.vehicleLabel, 'Não informado');
    assert.equal(card.serviceDate, null);
    assert.equal(card.odometer, null);
    assert.equal(card.cost, null);
  });
});
