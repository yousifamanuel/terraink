export function boundsToCacheKey(bounds) {
  return `${bounds.south.toFixed(5)}:${bounds.west.toFixed(5)}:${bounds.north.toFixed(5)}:${bounds.east.toFixed(5)}`;
}

export function getLocationSearchCacheKey(lookup, limit) {
  return `location-search:${lookup.toLowerCase()}:limit:${limit}`;
}

export function getGeocodeCacheKey(lookup) {
  return `geocode:location:${lookup.toLowerCase()}`;
}

export function getMapCacheKey(bounds, buildingBounds) {
  return `map:${boundsToCacheKey(bounds)}:buildings:${boundsToCacheKey(buildingBounds)}`;
}
