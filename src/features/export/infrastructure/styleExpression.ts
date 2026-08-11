/**
 * Minimal reader for the paint values `generateMapStyle` produces.
 *
 * MapLibre keeps style expressions unevaluated, but an SVG export has to write
 * concrete numbers. Only the two shapes the generator emits are handled —
 * constants and zoom-driven linear interpolations. Anything else resolves to
 * `undefined` so callers fall back to a documented default instead of guessing.
 */

function interpolateStops(stops: unknown[], zoom: number): number | undefined {
  if (stops.length < 2 || stops.length % 2 !== 0) {
    return undefined;
  }

  const pairs: [number, number][] = [];
  for (let index = 0; index < stops.length; index += 2) {
    const stopZoom = Number(stops[index]);
    const stopValue = Number(stops[index + 1]);
    if (!Number.isFinite(stopZoom) || !Number.isFinite(stopValue)) {
      return undefined;
    }
    pairs.push([stopZoom, stopValue]);
  }

  const first = pairs[0];
  const last = pairs[pairs.length - 1];
  if (zoom <= first[0]) return first[1];
  if (zoom >= last[0]) return last[1];

  for (let index = 1; index < pairs.length; index += 1) {
    const [stopZoom, stopValue] = pairs[index];
    if (zoom > stopZoom) continue;

    const [previousZoom, previousValue] = pairs[index - 1];
    const span = stopZoom - previousZoom;
    if (span <= 0) return stopValue;
    return previousValue + ((stopValue - previousValue) * (zoom - previousZoom)) / span;
  }

  return last[1];
}

export function resolveStyleValue(
  value: unknown,
  zoom: number,
): number | string | boolean | number[] | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  // Literal numeric arrays (line-dasharray) carry no operator head.
  if (value.every((entry) => typeof entry === "number")) {
    return value as number[];
  }

  if (value[0] !== "interpolate") {
    return undefined;
  }

  const [, interpolation, input, ...stops] = value;
  const isLinear = Array.isArray(interpolation) && interpolation[0] === "linear";
  const isZoomDriven = Array.isArray(input) && input[0] === "zoom";
  if (!isLinear || !isZoomDriven) {
    return undefined;
  }

  return interpolateStops(stops, zoom);
}

export function resolveNumber(
  value: unknown,
  zoom: number,
  fallback: number,
): number {
  const resolved = resolveStyleValue(value, zoom);
  return typeof resolved === "number" && Number.isFinite(resolved)
    ? resolved
    : fallback;
}

export function resolveColor(
  value: unknown,
  zoom: number,
  fallback: string,
): string {
  const resolved = resolveStyleValue(value, zoom);
  return typeof resolved === "string" && resolved.trim() ? resolved : fallback;
}
