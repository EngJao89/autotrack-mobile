import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Maintenance, Vehicle } from '@/services/api';

import {
  buildMaintenanceDetailRows,
  formatCostCents,
  formatOdometerKm,
  formatServiceDate,
  NOT_INFORMED,
  serviceDateLabel,
} from './detailFormat';

const base: Maintenance = {
  id: 'm1',
  vehicleId: 'v1',
  type: 'Troca de óleo',
  status: 'DONE',
  description: 'Troca de oleo',
  serviceDate: '2026-11-05T00:00:00.000Z',
  odometerKm: 45200,
  costCents: 18990,
  workshopName: 'Oficina Central',
  notes: 'Filtro trocado',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-05T00:00:00.000Z',
};

const vehicle: Vehicle = {
  id: 'v1',
  userId: 'u1',
  brand: 'Toyota',
  model: 'Corolla',
  version: null,
  year: 2020,
  licensePlate: 'abc1d23',
  color: null,
  fuelType: null,
  odometerKm: 99999,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('serviceDateLabel', () => {
  it('uses planned label for open statuses', () => {
    assert.equal(serviceDateLabel('TODO'), 'Data prevista');
    assert.equal(serviceDateLabel('IN_PROGRESS'), 'Data prevista');
  });

  it('uses service label when DONE', () => {
    assert.equal(serviceDateLabel('DONE'), 'Data do serviço');
  });
});

describe('format helpers', () => {
  it('does not invent cost or odometer', () => {
    assert.equal(formatCostCents(null), NOT_INFORMED);
    assert.equal(formatOdometerKm(null), NOT_INFORMED);
    assert.equal(formatServiceDate('not-a-date'), NOT_INFORMED);
  });

  it('formats cost as BRL', () => {
    assert.match(formatCostCents(18990), /189[,.]90/);
  });
});

describe('buildMaintenanceDetailRows', () => {
  it('maps business fields and uses maintenance odometer not vehicle', () => {
    const rows = buildMaintenanceDetailRows(base, vehicle);
    assert.equal(rows.title, 'Troca de oleo');
    assert.equal(rows.type, 'Troca de óleo');
    assert.equal(rows.odometer, '45.200 km');
    assert.equal(rows.vehicleLabel, 'Toyota Corolla · 2020');
    assert.equal(rows.plate, 'ABC1D23');
    assert.equal(rows.serviceDateLabel, 'Data do serviço');
    assert.equal(rows.workshop, 'Oficina Central');
    assert.equal(rows.notes, 'Filtro trocado');
  });

  it('marks missing essentials without inventing zeros', () => {
    const rows = buildMaintenanceDetailRows({
      ...base,
      description: null,
      odometerKm: null,
      costCents: null,
      workshopName: null,
      notes: null,
      status: 'TODO',
    });
    assert.equal(rows.title, 'Troca de óleo');
    assert.equal(rows.description, null);
    assert.equal(rows.odometer, NOT_INFORMED);
    assert.equal(rows.cost, NOT_INFORMED);
    assert.equal(rows.workshop, null);
    assert.equal(rows.serviceDateLabel, 'Data prevista');
  });
});
