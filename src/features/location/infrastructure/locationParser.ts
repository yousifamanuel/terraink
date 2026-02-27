import type { Location, SearchResult } from "../domain/types";

interface NominatimEntry {
  lat?: number | string;
  lon?: number | string;
  display_name?: string;
  label?: string;
  place_id?: number | string;
  city?: string;
  country?: string;
  address?: Record<string, string>;
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

  return {
    id: String(entry.place_id ?? label),
    label,
    city,
    country,
    lat,
    lon,
  };
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
