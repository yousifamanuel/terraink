export function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
