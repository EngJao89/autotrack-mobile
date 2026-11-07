import type { CreateVehicleInput, UpdateVehicleInput } from '@/services/api';

import { LICENSE_PLATE_MAX_LENGTH, normalizeLicensePlate } from './plate';

/** Mirrors autotrack-api `vehicles.constants`. */
export const VEHICLE_YEAR_MIN = 1900;

export function getVehicleYearMax(now = new Date()): number {
  return now.getFullYear() + 1;
}

export type VehicleFormFields = {
  brand: string;
  model: string;
  year: string;
  version: string;
  licensePlate: string;
  color: string;
  fuelType: string;
  odometerKm: string;
};

export type VehicleFormParseResult =
  { ok: true; data: CreateVehicleInput } | { ok: false; error: string };

function optionalTrimmed(value: string, maxLength: number): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function parseYear(
  raw: string,
  now = new Date()
): { ok: true; year: number } | { ok: false; error: string } {
  const year = Number.parseInt(raw.trim(), 10);
  const max = getVehicleYearMax(now);
  if (!Number.isFinite(year) || !Number.isInteger(year)) {
    return { ok: false, error: 'Ano inválido.' };
  }
  if (year < VEHICLE_YEAR_MIN || year > max) {
    return { ok: false, error: `Ano deve estar entre ${VEHICLE_YEAR_MIN} e ${max}.` };
  }
  return { ok: true, year };
}

function parseOdometer(
  raw: string
): { ok: true; odometerKm?: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, odometerKm: undefined };
  const odometerKm = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(odometerKm) || !Number.isInteger(odometerKm) || odometerKm < 0) {
    return { ok: false, error: 'Quilometragem deve ser um inteiro ≥ 0.' };
  }
  return { ok: true, odometerKm };
}

/**
 * Parse create/edit form fields into API payload.
 * Empty optionals are omitted (not sent as ""). Does not invent ownership or userId.
 */
export function parseVehicleForm(
  fields: VehicleFormFields,
  now = new Date()
): VehicleFormParseResult {
  const brand = fields.brand.trim();
  const model = fields.model.trim();
  if (!brand || !model) {
    return { ok: false, error: 'Informe marca e modelo.' };
  }
  if (brand.length > 80 || model.length > 80) {
    return { ok: false, error: 'Marca e modelo devem ter no máximo 80 caracteres.' };
  }

  const yearResult = parseYear(fields.year, now);
  if (!yearResult.ok) return yearResult;

  const odometerResult = parseOdometer(fields.odometerKm);
  if (!odometerResult.ok) return odometerResult;

  const licensePlate = normalizeLicensePlate(fields.licensePlate);
  if (fields.licensePlate.trim() && !licensePlate) {
    return { ok: false, error: 'Placa inválida.' };
  }
  if (fields.licensePlate.trim().length > LICENSE_PLATE_MAX_LENGTH) {
    return { ok: false, error: `Placa deve ter no máximo ${LICENSE_PLATE_MAX_LENGTH} caracteres.` };
  }

  const data: CreateVehicleInput = {
    brand,
    model,
    year: yearResult.year,
  };

  const version = optionalTrimmed(fields.version, 80);
  if (version) data.version = version;

  if (licensePlate) data.licensePlate = licensePlate;

  const color = optionalTrimmed(fields.color, 40);
  if (color) data.color = color;

  const fuelRaw = optionalTrimmed(fields.fuelType, 30);
  if (fuelRaw) data.fuelType = fuelRaw.toLowerCase();

  if (odometerResult.odometerKm !== undefined) {
    data.odometerKm = odometerResult.odometerKm;
  }

  return { ok: true, data };
}

/** Same shape as create; PATCH body is Partial of create DTO. */
export function parseVehicleUpdateForm(
  fields: VehicleFormFields,
  now = new Date()
): { ok: true; data: UpdateVehicleInput } | { ok: false; error: string } {
  return parseVehicleForm(fields, now);
}

export function fieldsFromVehicle(vehicle: {
  brand: string;
  model: string;
  year: number;
  version: string | null;
  licensePlate: string | null;
  color: string | null;
  fuelType: string | null;
  odometerKm: number | null;
}): VehicleFormFields {
  return {
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    version: vehicle.version ?? '',
    licensePlate: vehicle.licensePlate ?? '',
    color: vehicle.color ?? '',
    fuelType: vehicle.fuelType ?? '',
    odometerKm: vehicle.odometerKm != null ? String(vehicle.odometerKm) : '',
  };
}
