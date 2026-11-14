import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getTabIcon, listDefaultIconKeys, TAB_ICON_MAP } from './tabIcons';

describe('TAB_ICON_MAP (ATP-45)', () => {
  it('covers all current bottom-tab routes exactly once', () => {
    const routes = TAB_ICON_MAP.map((item) => item.route);
    assert.deepEqual(routes, ['index', 'vehicles', 'maintenances', 'design-system']);
    assert.equal(new Set(routes).size, routes.length);
  });

  it('keeps Portuguese labels aligned with product tabs', () => {
    assert.equal(getTabIcon('index').label, 'Home');
    assert.equal(getTabIcon('vehicles').label, 'Veículos');
    assert.equal(getTabIcon('maintenances').label, 'Manutenções');
    assert.equal(getTabIcon('design-system').label, 'UI Kit');
  });

  it('uses a car glyph for Veículos', () => {
    const vehicles = getTabIcon('vehicles');
    assert.equal(vehicles.sf.default, 'car');
    assert.equal(vehicles.sf.selected, 'car.fill');
    assert.equal(vehicles.md.default, 'directions_car');
    assert.equal(vehicles.md.selected, 'directions_car_filled');
  });

  it('keeps house for Home / dashboard', () => {
    const home = getTabIcon('index');
    assert.equal(home.sf.default, 'house');
    assert.equal(home.md.default, 'home');
  });

  it('uses a tool glyph for Manutenções', () => {
    const maintenances = getTabIcon('maintenances');
    assert.equal(maintenances.sf.default, 'wrench.and.screwdriver');
    assert.equal(maintenances.md.default, 'build');
  });

  it('does not reuse the same default icon across different destinations', () => {
    const keys = listDefaultIconKeys();
    assert.equal(new Set(keys).size, keys.length);
  });
});
