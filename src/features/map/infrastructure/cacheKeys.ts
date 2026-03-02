export function getLocationSearchCacheKey(
  lookup: string,
  limit: number,
): string {
  return `location-search:${lookup.toLowerCase()}:limit:${limit}`;
}

export function getGeocodeCacheKey(lookup: string): string {
  return `geocode:location:${lookup.toLowerCase()}`;
}
