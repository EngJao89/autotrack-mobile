import type { Vehicle } from '@/services/api';

import { formatLicensePlate } from './plate';

export function vehicleTitle(vehicle: Pick<Vehicle, 'brand' | 'model'>): string {
  return `${vehicle.brand} ${vehicle.model}`.trim();
}

export function vehicleSubtitle(vehicle: Pick<Vehicle, 'year' | 'licensePlate' | 'color'>): string {
  const parts = [String(vehicle.year), formatLicensePlate(vehicle.licensePlate)];
  if (vehicle.color) parts.push(vehicle.color);
  return parts.join(' · ');
}
