import { createBounds } from "./bounds";
import type { Coordinate, PosterBoundsResult } from "./types";
import {
  FETCH_PADDING,
  MIN_SAFE_DISTANCE_METERS,
  MIN_SAFE_ASPECT_RATIO,
} from "./constants";

export function computePosterAndFetchBounds(
  center: Coordinate,
  distanceMeters: number,
  aspectRatio: number,
  fetchPadding = FETCH_PADDING,
): PosterBoundsResult {
  const safeDistance = Math.max(MIN_SAFE_DISTANCE_METERS, distanceMeters);
  const safeAspect = Math.max(MIN_SAFE_ASPECT_RATIO, aspectRatio);

  let halfMetersX = safeDistance;
  let halfMetersY = safeDistance;

  if (safeAspect > 1) {
    halfMetersY = safeDistance / safeAspect;
  } else {
    halfMetersX = safeDistance * safeAspect;
  }

  const fetchHalfMeters = Math.max(halfMetersX, halfMetersY) * fetchPadding;

  return {
    posterBounds: createBounds(
      center.lat,
      center.lon,
      halfMetersX,
      halfMetersY,
    ),
    fetchBounds: createBounds(
      center.lat,
      center.lon,
      fetchHalfMeters,
      fetchHalfMeters,
    ),
    halfMetersX,
    halfMetersY,
    fetchHalfMeters,
  };
}

export function formatCoordinates(lat: number, lon: number): string {
  const northSouth = lat >= 0 ? "N" : "S";
  const eastWest = lon >= 0 ? "E" : "W";

  return `${Math.abs(lat).toFixed(4)}° ${northSouth} / ${Math.abs(lon).toFixed(
    4,
  )}° ${eastWest}`;
}
