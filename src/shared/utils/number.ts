/**
 * Parses a numeric input field value, throwing if invalid.
 */
export function parseNumericInput(
  label: string,
  value: string | number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number`);
  }
  return parsed;
}

/**
 * Ensures a positive number, falling back to a default if invalid or non-positive.
 * Consolidates the duplicated toPositiveNumber / normalizePositiveNumber.
 */
export function toPositiveNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

/**
 * Parses a typed decimal number, accepting "," as the decimal point.
 * Returns null while the text is not (yet) a complete number, e.g. "-" or "52,".
 */
export function parseDecimalInput(value: string): number | null {
  const text = String(value ?? "").trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}
