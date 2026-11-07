import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getVehicleYearMax, parseVehicleForm, VEHICLE_YEAR_MIN } from './validation';

const base = {
  brand: 'Toyota',
  model: 'Corolla',
  year: '2022',
  version: '',
  licensePlate: '',
  color: '',
  fuelType: '',
  odometerKm: '',
};

describe('parseVehicleForm', () => {
  it('requires brand and model', () => {
    const result = parseVehicleForm({ ...base, brand: '  ', model: '' });
    assert.equal(result.ok, false);
  });

  it('accepts minimum fields', () => {
    const result = parseVehicleForm(base);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.data, { brand: 'Toyota', model: 'Corolla', year: 2022 });
    }
  });

  it('normalizes plate and fuel', () => {
    const result = parseVehicleForm({
      ...base,
      licensePlate: ' abc1d23 ',
      fuelType: ' Flex ',
      odometerKm: '45000',
      version: 'XEi',
      color: 'Prata',
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.licensePlate, 'ABC1D23');
      assert.equal(result.data.fuelType, 'flex');
      assert.equal(result.data.odometerKm, 45000);
      assert.equal(result.data.version, 'XEi');
      assert.equal(result.data.color, 'Prata');
    }
  });

  it('rejects year out of range', () => {
    const now = new Date('2026-11-06T00:00:00.000Z');
    const low = parseVehicleForm({ ...base, year: String(VEHICLE_YEAR_MIN - 1) }, now);
    assert.equal(low.ok, false);
    const high = parseVehicleForm({ ...base, year: String(getVehicleYearMax(now) + 1) }, now);
    assert.equal(high.ok, false);
  });

  it('rejects negative odometer', () => {
    const result = parseVehicleForm({ ...base, odometerKm: '-1' });
    assert.equal(result.ok, false);
  });
});
