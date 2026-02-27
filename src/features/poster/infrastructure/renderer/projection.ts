import type { Bounds, Coordinate } from "@/shared/geo/types";

interface ScreenPoint {
  x: number;
  y: number;
}

export type Projector = (point: Coordinate) => ScreenPoint;

function mercatorY(lat: number): number {
  const clamped = Math.max(-85, Math.min(85, lat));
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

export function createProjector(
  bounds: Bounds,
  width: number,
  height: number,
): Projector {
  const eastWestSpan = bounds.east - bounds.west || 1e-9;
  const northMerc = mercatorY(bounds.north);
  const southMerc = mercatorY(bounds.south);
  const mercSpan = northMerc - southMerc || 1e-9;

  return (point: Coordinate): ScreenPoint => {
    const x = ((point.lon - bounds.west) / eastWestSpan) * width;
    const y = ((northMerc - mercatorY(point.lat)) / mercSpan) * height;
    return { x, y };
  };
}

export function pointsIntersectBounds(
  points: Coordinate[],
  bounds: Bounds,
): boolean {
  if (!Array.isArray(points) || points.length === 0) {
    return false;
  }

  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    if (
      !point ||
      typeof point.lat !== "number" ||
      typeof point.lon !== "number" ||
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lon)
    ) {
      continue;
    }

    if (point.lat < minLat) minLat = point.lat;
    if (point.lat > maxLat) maxLat = point.lat;
    if (point.lon < minLon) minLon = point.lon;
    if (point.lon > maxLon) maxLon = point.lon;
  }

  if (
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat) ||
    !Number.isFinite(minLon) ||
    !Number.isFinite(maxLon)
  ) {
    return false;
  }

  return !(
    maxLon < bounds.west ||
    minLon > bounds.east ||
    maxLat < bounds.south ||
    minLat > bounds.north
  );
}

export function polygonArea(points: ScreenPoint[]): number {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area) * 0.5;
}
