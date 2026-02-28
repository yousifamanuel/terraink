export const GEOCODE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const LOCATION_SEARCH_TTL_MS = 24 * 60 * 60 * 1000;
export const MAP_TTL_MS = 12 * 60 * 60 * 1000;

export const MAX_POINTS_PER_LINE = 120;
export const MAX_POINTS_PER_POLYGON = 180;
export const MAX_POINTS_PER_BUILDING = 32;
export const MAX_BUILDING_POLYGONS = 4200;

export const HIGHWAY_FILTER =
  "motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|living_street|unclassified";

export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
