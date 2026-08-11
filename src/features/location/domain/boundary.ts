import { clamp } from "@/shared/geo/math";

/** Rough meters per degree of latitude, good enough to size a simplification. */
const METERS_PER_DEGREE = 111_320;

/**
 * Boundary detail only has to survive the poster's own framing, so the
 * simplification tolerance tracks the visible extent rather than using a fixed
 * value. Without it an unsimplified country outline is several megabytes.
 *
 * `distance` is the map half-width, so a 300 DPI poster renders roughly
 * `distance / 1200` meters per pixel. Dividing by 600 keeps the simplification
 * error around two exported pixels.
 */
const TOLERANCE_EXTENT_DIVISOR = 600;
const MIN_TOLERANCE_DEG = 0.00002;
const MAX_TOLERANCE_DEG = 0.05;

/**
 * Tolerances are snapped to a doubling scale so nudging the distance slider
 * reuses a cached boundary instead of issuing a new request per pixel.
 */
function snapToDoublingScale(toleranceDeg: number): number {
  const steps = Math.ceil(Math.log2(toleranceDeg / MIN_TOLERANCE_DEG));
  return MIN_TOLERANCE_DEG * Math.pow(2, Math.max(steps, 0));
}

export function resolveBoundaryTolerance(distanceMeters: number): number {
  const extentDeg = Number(distanceMeters) / METERS_PER_DEGREE;
  if (!Number.isFinite(extentDeg) || extentDeg <= 0) {
    return MIN_TOLERANCE_DEG;
  }

  const tolerance = clamp(
    extentDeg / TOLERANCE_EXTENT_DIVISOR,
    MIN_TOLERANCE_DEG,
    MAX_TOLERANCE_DEG,
  );

  return clamp(
    snapToDoublingScale(tolerance),
    MIN_TOLERANCE_DEG,
    MAX_TOLERANCE_DEG,
  );
}
