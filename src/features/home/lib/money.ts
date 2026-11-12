/**
 * Money helpers for maintenance service cost (ATP-47).
 * Wire format: integer `costCents` (API CreateMaintenanceDto). UI: BRL reais.
 */

/** Aligns with repair-estimates unit price ceiling on the API. */
export const COST_CENTS_MAX = 100_000_000;

export type ParseReaisResult =
  { ok: true; cents: number } | { ok: true; cents: undefined } | { ok: false; error: string };

/**
 * Parse a BRL amount typed/pasted by the user into integer cents.
 * Empty → undefined (omit field; distinct from zero).
 * Accepts: `150`, `150,90`, `1.234,56`, `R$ 150,00`, `150.90`.
 * Does not send formatted currency strings to the API.
 */
export function parseReaisToCents(raw: string): ParseReaisResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, cents: undefined };
  }

  let normalized = trimmed
    .replace(/R\$\s?/gi, '')
    .replace(/\s/g, '')
    .replace(/[^\d.,-]/g, '');

  if (!normalized || normalized === '-' || normalized === '.' || normalized === ',') {
    return { ok: false, error: 'Informe um valor válido em reais.' };
  }

  if (normalized.includes('-')) {
    return { ok: false, error: 'Valor do serviço não pode ser negativo.' };
  }

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    // Brazilian: 1.234,56 — dots = thousands, comma = decimal
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = normalized.replace(',', '.');
  } else if (hasDot) {
    const parts = normalized.split('.');
    if (parts.length > 2) {
      // 1.234.567 without decimal comma — treat dots as thousands
      normalized = parts.join('');
    }
    // else keep single dot as decimal (150.90)
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, error: 'Informe um valor válido em reais.' };
  }

  const reais = Number(normalized);
  if (!Number.isFinite(reais)) {
    return { ok: false, error: 'Informe um valor válido em reais.' };
  }

  const cents = Math.round(reais * 100);
  if (!Number.isInteger(cents) || cents < 0) {
    return { ok: false, error: 'Informe um valor válido em reais.' };
  }
  if (cents > COST_CENTS_MAX) {
    return { ok: false, error: 'Valor do serviço excede o limite permitido.' };
  }

  return { ok: true, cents };
}
