export interface Location {
  id: string;
  label: string;
  city: string;
  country: string;
  countryCode?: string;
  continent?: string;
  lat: number;
  lon: number;
  /** OSM element the result resolves to — needed to look up its boundary. */
  osmType?: string;
  osmId?: number;
}

export interface SearchResult extends Location {}

/**
 * Exterior rings of a location's administrative area, in [lon, lat] order.
 * Interior rings (lakes, enclaves) are dropped: they are negligible at poster
 * scale and nested rings are not representable in a single mask polygon.
 */
export interface LocationBoundary {
  id: string;
  rings: number[][][];
}
