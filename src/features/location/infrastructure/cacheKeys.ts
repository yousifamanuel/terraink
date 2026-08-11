export function getLocationSearchCacheKey(
  lookup: string,
  limit: number,
): string {
  return `location-search:${lookup.toLowerCase()}:limit:${limit}`;
}

export function getGeocodeCacheKey(lookup: string): string {
  return `geocode:location:${lookup.toLowerCase()}`;
}

export function getBoundaryCacheKey(
  osmRef: string,
  toleranceDeg: number,
): string {
  return `boundary:${osmRef}:tolerance:${toleranceDeg}`;
}

export function getReverseGeocodeCacheKey(lat: number, lon: number): string {
  const roundedLat = lat.toFixed(4);
  const roundedLon = lon.toFixed(4);
  return `geocode:reverse:${roundedLat},${roundedLon}`;
}
