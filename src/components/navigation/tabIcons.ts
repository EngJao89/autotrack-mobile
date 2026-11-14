/**
 * Bottom-tab icon mapping (ATP-45).
 * NativeTabs: SF Symbols (`sf`) on iOS, Material Symbols (`md`) on Android.
 * One semantic glyph family per destination — no shared generic fallback.
 */

export const TAB_ICON_MAP = [
  {
    route: 'index',
    label: 'Home',
    sf: { default: 'house', selected: 'house.fill' },
    md: { default: 'home', selected: 'home_filled' },
  },
  {
    route: 'vehicles',
    label: 'Veículos',
    sf: { default: 'car', selected: 'car.fill' },
    md: { default: 'directions_car', selected: 'directions_car_filled' },
  },
  {
    route: 'maintenances',
    label: 'Manutenções',
    sf: { default: 'wrench.and.screwdriver', selected: 'wrench.and.screwdriver.fill' },
    // Material has no distinct filled "build"; same glyph, tint handles selection.
    md: { default: 'build', selected: 'build' },
  },
  {
    route: 'design-system',
    label: 'UI Kit',
    sf: { default: 'paintpalette', selected: 'paintpalette.fill' },
    // Material palette has no separate filled token in the Expo set; tint handles selection.
    md: { default: 'palette', selected: 'palette' },
  },
] as const;

export type TabRouteName = (typeof TAB_ICON_MAP)[number]['route'];

export function getTabIcon(route: TabRouteName): (typeof TAB_ICON_MAP)[number] {
  const entry = TAB_ICON_MAP.find((item) => item.route === route);
  if (!entry) {
    throw new Error(`No tab icon mapping for route: ${route}`);
  }
  return entry;
}

/** Unique default glyphs — guards against repeating the same generic icon. */
export function listDefaultIconKeys(): string[] {
  return TAB_ICON_MAP.map((item) => `${item.sf.default}|${item.md.default}`);
}
