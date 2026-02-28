import type { MapData } from "../domain/types";

export function normalizeMapData(data: any): MapData {
  if (!data || typeof data !== "object") {
    return {
      roads: [],
      waterPolygons: [],
      parkPolygons: [],
      buildingPolygons: [],
    };
  }

  return {
    roads: Array.isArray(data.roads) ? data.roads : [],
    waterPolygons: Array.isArray(data.waterPolygons) ? data.waterPolygons : [],
    parkPolygons: Array.isArray(data.parkPolygons) ? data.parkPolygons : [],
    buildingPolygons: Array.isArray(data.buildingPolygons)
      ? data.buildingPolygons
      : [],
  };
}

export function isFiniteCoordinatePair(point: any): boolean {
  return (
    point &&
    typeof point.lat === "number" &&
    typeof point.lon === "number" &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon)
  );
}

export function isClosedPolygon(
  points: Array<{ lat: number; lon: number }>,
): boolean {
  if (points.length < 4) return false;
  const first = points[0];
  const last = points[points.length - 1];
  return (
    Math.abs(first.lat - last.lat) < 1e-6 &&
    Math.abs(first.lon - last.lon) < 1e-6
  );
}

export function normalizeHighway(highway: unknown): string {
  if (Array.isArray(highway)) return String(highway[0] ?? "unclassified");
  if (typeof highway === "string" && highway.trim().length > 0)
    return highway.split(";")[0].trim();
  return "unclassified";
}

export function hasWaterTags(tags: Record<string, string>): boolean {
  const natural = String(tags.natural ?? "");
  const waterway = String(tags.waterway ?? "");
  return (
    natural === "water" ||
    natural === "bay" ||
    natural === "strait" ||
    waterway === "riverbank"
  );
}

export function hasParkTags(tags: Record<string, string>): boolean {
  const leisure = String(tags.leisure ?? "");
  const landuse = String(tags.landuse ?? "");
  return leisure === "park" || landuse === "grass";
}

export function hasBuildingTag(tags: Record<string, string>): boolean {
  if (!tags || typeof tags !== "object" || !("building" in tags)) return false;
  const value = String(tags.building ?? "")
    .trim()
    .toLowerCase();
  return value !== "no";
}

export function downsamplePoints<T>(points: T[], maxPoints: number): T[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const sampled = [points[0]];
  for (let i = step; i < points.length - 1; i += step) sampled.push(points[i]);
  sampled.push(points[points.length - 1]);
  return sampled;
}

export function limitCollection<T>(items: T[], maxItems: number): T[] {
  if (items.length <= maxItems) return items;
  const step = Math.ceil(items.length / maxItems);
  const reduced: T[] = [];
  for (let i = 0; i < items.length; i += step) reduced.push(items[i]);
  return reduced;
}

export function pickFirstAddressValue(
  address: Record<string, unknown>,
  keys: string[],
): string {
  if (!address || typeof address !== "object") return "";
  for (const key of keys) {
    const value = address[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}
