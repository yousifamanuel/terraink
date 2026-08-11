import type { Location, SearchResult } from "../domain/types";

interface NominatimEntry {
  lat?: number | string;
  lon?: number | string;
  display_name?: string;
  label?: string;
  place_id?: number | string;
  osm_type?: string;
  osm_id?: number | string;
  osmType?: string;
  osmId?: number | string;
  city?: string;
  country?: string;
  address?: Record<string, string>;
}

interface NominatimGeometry {
  type?: string;
  coordinates?: unknown;
}

const MIN_RING_POSITIONS = 4;

function inferContinentFromCoordinates(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "";
  if (lat <= -60) return "Antarctica";
  if (lat >= 5 && lat <= 82 && lon >= -170 && lon <= -20) return "North America";
  if (lat <= 15 && lat >= -60 && lon >= -92 && lon <= -30) return "South America";
  if (lat >= 35 && lon >= -25 && lon <= 60) return "Europe";
  if (lat >= -35 && lat <= 37 && lon >= -20 && lon <= 55) return "Africa";
  if (lat >= -10 && lon >= 110 && lon <= 180) return "Oceania";
  if (lat >= -50 && lon >= 110 && lon <= 180) return "Oceania";
  if (lon >= 25 && lon <= 180) return "Asia";
  return "";
}

function pickFirstAddressValue(
  address: Record<string, string>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = address[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

export function normalizeLocationResult(
  entry: NominatimEntry | null | undefined,
  fallbackLabel = "",
): SearchResult | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const lat = Number(entry.lat);
  const lon = Number(entry.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const label = String(
    entry.display_name ?? entry.label ?? fallbackLabel,
  ).trim();
  if (!label) {
    return null;
  }

  const address = entry.address ?? {};
  const city =
    pickFirstAddressValue(address, [
      "city",
      "town",
      "village",
      "hamlet",
      "municipality",
      "county",
      "state",
    ]) || String(entry.city ?? "").trim();
  const country =
    pickFirstAddressValue(address, ["country"]) ||
    String(entry.country ?? "").trim();
  const countryCode = pickFirstAddressValue(address, ["country_code"]).toUpperCase();
  const continent =
    pickFirstAddressValue(address, ["continent"]) ||
    inferContinentFromCoordinates(lat, lon);

  // Cached entries are re-normalized from a previous output, so both the raw
  // Nominatim keys and the normalized ones have to round-trip.
  const osmType = String(entry.osm_type ?? entry.osmType ?? "")
    .trim()
    .toLowerCase();
  const osmId = Number(entry.osm_id ?? entry.osmId);

  return {
    id: String(entry.place_id ?? label),
    label,
    city,
    country,
    countryCode,
    continent,
    lat,
    lon,
    ...(osmType ? { osmType } : {}),
    ...(Number.isInteger(osmId) && osmId > 0 ? { osmId } : {}),
  };
}

function toRing(value: unknown): number[][] | null {
  if (!Array.isArray(value) || value.length < MIN_RING_POSITIONS) {
    return null;
  }

  const ring: number[][] = [];
  for (const position of value) {
    if (!Array.isArray(position) || position.length < 2) {
      return null;
    }
    const lon = Number(position[0]);
    const lat = Number(position[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
      return null;
    }
    ring.push([lon, lat]);
  }

  return ring;
}

/**
 * Extracts the exterior ring of every polygon in a Nominatim `geojson` value.
 * Non-area geometries (points, lines) yield an empty list.
 */
export function parseBoundaryRings(geometry: unknown): number[][][] {
  const geojson = (geometry ?? {}) as NominatimGeometry;
  const { coordinates } = geojson;

  if (geojson.type === "Polygon" && Array.isArray(coordinates)) {
    const ring = toRing(coordinates[0]);
    return ring ? [ring] : [];
  }

  if (geojson.type === "MultiPolygon" && Array.isArray(coordinates)) {
    const rings: number[][][] = [];
    for (const polygon of coordinates) {
      if (!Array.isArray(polygon)) continue;
      const ring = toRing(polygon[0]);
      if (ring) rings.push(ring);
    }
    return rings;
  }

  return [];
}

export function parseLocationResponseItems(payload: unknown): SearchResult[] {
  const entries = Array.isArray(payload) ? (payload as NominatimEntry[]) : [];
  const suggestions: SearchResult[] = [];
  const seenLabels = new Set<string>();

  for (const entry of entries) {
    const normalized = normalizeLocationResult(entry);
    if (!normalized) {
      continue;
    }

    const labelKey = normalized.label.toLowerCase();
    if (seenLabels.has(labelKey)) {
      continue;
    }

    seenLabels.add(labelKey);
    suggestions.push(normalized);
  }

  return suggestions;
}
