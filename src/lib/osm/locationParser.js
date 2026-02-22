import { pickFirstAddressValue } from "./helpers";

export function normalizeLocationResult(entry, fallbackLabel = "") {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const lat = Number(entry.lat);
  const lon = Number(entry.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const label = String(entry.display_name ?? entry.label ?? fallbackLabel).trim();
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
    pickFirstAddressValue(address, ["country"]) || String(entry.country ?? "").trim();

  return {
    id: String(entry.place_id ?? label),
    label,
    city,
    country,
    lat,
    lon,
  };
}

export function parseLocationResponseItems(payload) {
  const entries = Array.isArray(payload) ? payload : [];
  const suggestions = [];
  const seenLabels = new Set();

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
