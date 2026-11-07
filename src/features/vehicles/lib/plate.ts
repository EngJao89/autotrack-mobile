/**
 * Plate normalization aligned with autotrack-api CreateVehicleDto:
 * trim + uppercase. No global uniqueness on the client.
 */

export const LICENSE_PLATE_MAX_LENGTH = 10;

/** Normalize plate for API transport (trim + uppercase). Empty → undefined. */
export function normalizeLicensePlate(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return undefined;
  return normalized.slice(0, LICENSE_PLATE_MAX_LENGTH);
}

/** Display helper — never invents a plate. */
export function formatLicensePlate(value: string | null | undefined): string {
  return normalizeLicensePlate(value) ?? '—';
}
