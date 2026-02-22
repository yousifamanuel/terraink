export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function parseNumericInput(label, value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number`);
  }

  return parsed;
}
