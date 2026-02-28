export interface Bounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface PosterBoundsResult {
  posterBounds: Bounds;
  fetchBounds: Bounds;
  halfMetersX: number;
  halfMetersY: number;
  fetchHalfMeters: number;
}
