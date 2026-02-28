import { METERS_PER_DEGREE, MIN_COSINE } from "./constants";
import { clamp, toRadians } from "./math";
import type { Bounds } from "./types";

export function metersToLatDelta(meters: number): number {
  return meters / METERS_PER_DEGREE;
}

export function metersToLonDelta(meters: number, atLatitude: number): number {
  const cosine = Math.max(
    Math.abs(Math.cos(toRadians(atLatitude))),
    MIN_COSINE,
  );

  return meters / (METERS_PER_DEGREE * cosine);
}

export function createBounds(
  centerLat: number,
  centerLon: number,
  halfMetersX: number,
  halfMetersY: number,
): Bounds {
  const latDelta = metersToLatDelta(halfMetersY);
  const lonDelta = metersToLonDelta(halfMetersX, centerLat);

  return {
    south: clamp(centerLat - latDelta, -85, 85),
    west: centerLon - lonDelta,
    north: clamp(centerLat + latDelta, -85, 85),
    east: centerLon + lonDelta,
  };
}
