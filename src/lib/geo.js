const METERS_PER_DEGREE = 111_320;
const MIN_COSINE = 0.1;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function metersToLatDelta(meters) {
  return meters / METERS_PER_DEGREE;
}

export function metersToLonDelta(meters, atLatitude) {
  const cosine = Math.max(
    Math.abs(Math.cos(toRadians(atLatitude))),
    MIN_COSINE
  );
  return meters / (METERS_PER_DEGREE * cosine);
}

export function createBounds(centerLat, centerLon, halfMetersX, halfMetersY) {
  const latDelta = metersToLatDelta(halfMetersY);
  const lonDelta = metersToLonDelta(halfMetersX, centerLat);

  return {
    south: clamp(centerLat - latDelta, -85, 85),
    west: centerLon - lonDelta,
    north: clamp(centerLat + latDelta, -85, 85),
    east: centerLon + lonDelta,
  };
}

export function computePosterAndFetchBounds(
  center,
  distanceMeters,
  aspectRatio,
  fetchPadding = 1.35
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
      fetchHalfMeters
    ),
    halfMetersX,
    halfMetersY,
    fetchHalfMeters,
  };
}

export function formatCoordinates(lat, lon) {
  const northSouth = lat >= 0 ? "N" : "S";
  const eastWest = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${northSouth} / ${Math.abs(lon).toFixed(
    4
  )}° ${eastWest}`;
}
