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
