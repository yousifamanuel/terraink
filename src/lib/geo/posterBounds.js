import { createBounds } from "./bounds";

export function computePosterAndFetchBounds(
  center,
  distanceMeters,
  aspectRatio,
  fetchPadding = 1.35,
) {
  const safeDistance = Math.max(1_000, distanceMeters);
  const safeAspect = Math.max(0.2, aspectRatio);

  let halfMetersX = safeDistance;
  let halfMetersY = safeDistance;

  if (safeAspect > 1) {
    halfMetersY = safeDistance / safeAspect;
  } else {
    halfMetersX = safeDistance * safeAspect;
  }

  const fetchHalfMeters = Math.max(halfMetersX, halfMetersY) * fetchPadding;

  return {
    posterBounds: createBounds(center.lat, center.lon, halfMetersX, halfMetersY),
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

export function formatCoordinates(lat, lon) {
  const northSouth = lat >= 0 ? "N" : "S";
  const eastWest = lon >= 0 ? "E" : "W";

  return `${Math.abs(lat).toFixed(4)} deg ${northSouth} / ${Math.abs(lon).toFixed(
    4,
  )} deg ${eastWest}`;
}
