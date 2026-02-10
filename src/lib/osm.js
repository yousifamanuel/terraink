import { readCache, writeCache } from "./cache";

const GEOCODE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAP_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_POINTS_PER_LINE = 120;
const MAX_POINTS_PER_POLYGON = 180;
const MAX_POINTS_PER_BUILDING = 32;
const MAX_BUILDING_POLYGONS = 4200;
const HIGHWAY_FILTER =
  "motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|living_street|unclassified";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function boundsToCacheKey(bounds) {
  return `${bounds.south.toFixed(5)}:${bounds.west.toFixed(
    5
  )}:${bounds.north.toFixed(5)}:${bounds.east.toFixed(5)}`;
}

function normalizeMapData(data) {
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

function isFiniteCoordinatePair(point) {
  return (
    point &&
    typeof point.lat === "number" &&
    typeof point.lon === "number" &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon)
  );
}

function isClosedPolygon(points) {
  if (points.length < 4) {
    return false;
  }

  const first = points[0];
  const last = points[points.length - 1];
  return (
    Math.abs(first.lat - last.lat) < 1e-6 && Math.abs(first.lon - last.lon) < 1e-6
  );
}

function normalizeHighway(highway) {
  if (Array.isArray(highway)) {
    return String(highway[0] ?? "unclassified");
  }

  if (typeof highway === "string" && highway.trim().length > 0) {
    return highway.split(";")[0].trim();
  }

  return "unclassified";
}

function hasWaterTags(tags) {
  const naturalTag = String(tags.natural ?? "");
  const waterwayTag = String(tags.waterway ?? "");
  return (
    naturalTag === "water" ||
    naturalTag === "bay" ||
    naturalTag === "strait" ||
    waterwayTag === "riverbank"
  );
}

function hasParkTags(tags) {
  const leisureTag = String(tags.leisure ?? "");
  const landuseTag = String(tags.landuse ?? "");
  return leisureTag === "park" || landuseTag === "grass";
}

function hasBuildingTag(tags) {
  if (!tags || typeof tags !== "object") {
    return false;
  }

  if (!("building" in tags)) {
    return false;
  }

  const value = String(tags.building ?? "").trim().toLowerCase();
  return value !== "no";
}

function buildOverpassQuery(bounds, buildingBounds) {
  const south = bounds.south.toFixed(6);
  const west = bounds.west.toFixed(6);
  const north = bounds.north.toFixed(6);
  const east = bounds.east.toFixed(6);
  const buildingSouth = buildingBounds.south.toFixed(6);
  const buildingWest = buildingBounds.west.toFixed(6);
  const buildingNorth = buildingBounds.north.toFixed(6);
  const buildingEast = buildingBounds.east.toFixed(6);

  return `
[out:json][timeout:25];
(
  way["highway"~"${HIGHWAY_FILTER}"](${south},${west},${north},${east});
  way["natural"~"water|bay|strait"](${south},${west},${north},${east});
  way["waterway"="riverbank"](${south},${west},${north},${east});
  way["leisure"="park"](${south},${west},${north},${east});
  way["landuse"="grass"](${south},${west},${north},${east});
  way["building"](${buildingSouth},${buildingWest},${buildingNorth},${buildingEast});
  relation["building"](${buildingSouth},${buildingWest},${buildingNorth},${buildingEast});
);
out geom qt;
`.trim();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseOverpassPayload(payload) {
  const roads = [];
  const waterPolygons = [];
  const parkPolygons = [];
  const buildingPolygons = [];

  const elements = Array.isArray(payload?.elements) ? payload.elements : [];

  function downsamplePoints(points, maxPoints) {
    if (points.length <= maxPoints) {
      return points;
    }

    const step = Math.ceil(points.length / maxPoints);
    const sampled = [points[0]];
    for (let index = step; index < points.length - 1; index += step) {
      sampled.push(points[index]);
    }
    sampled.push(points[points.length - 1]);
    return sampled;
  }

  function limitCollection(items, maxItems) {
    if (items.length <= maxItems) {
      return items;
    }

    const step = Math.ceil(items.length / maxItems);
    const reduced = [];
    for (let index = 0; index < items.length; index += step) {
      reduced.push(items[index]);
    }
    return reduced;
  }

  for (const element of elements) {
    if (element.type !== "way" && element.type !== "relation") {
      continue;
    }

    const tags = element.tags ?? {};
    const geometry = Array.isArray(element.geometry) ? element.geometry : [];
    if (geometry.length < 2) {
      continue;
    }

    const points = geometry
      .map((point) => ({
        lat: Number(point.lat),
        lon: Number(point.lon),
      }))
      .filter(isFiniteCoordinatePair);

    if (points.length < 2) {
      continue;
    }

    if (tags.highway) {
      roads.push({
        highway: normalizeHighway(tags.highway),
        points: downsamplePoints(points, MAX_POINTS_PER_LINE),
      });
      continue;
    }

    if (hasBuildingTag(tags) && isClosedPolygon(points)) {
      buildingPolygons.push(downsamplePoints(points, MAX_POINTS_PER_BUILDING));
      continue;
    }

    if (hasWaterTags(tags) && isClosedPolygon(points)) {
      waterPolygons.push(downsamplePoints(points, MAX_POINTS_PER_POLYGON));
      continue;
    }

    if (hasParkTags(tags) && isClosedPolygon(points)) {
      parkPolygons.push(downsamplePoints(points, MAX_POINTS_PER_POLYGON));
    }
  }

  return {
    roads,
    waterPolygons,
    parkPolygons,
    buildingPolygons: limitCollection(buildingPolygons, MAX_BUILDING_POLYGONS),
  };
}

export async function geocodeCity(city, country) {
  const lookup = `${city}, ${country}`;
  const cacheKey = `geocode:${lookup.trim().toLowerCase()}`;
  const cached = readCache(cacheKey, GEOCODE_TTL_MS);
  if (cached) {
    return cached;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
    lookup
  )}`;
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
      },
    },
    16_000
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No coordinates found for "${lookup}"`);
  }

  const first = data[0];
  const result = {
    lat: Number(first.lat),
    lon: Number(first.lon),
    displayName: String(first.display_name ?? lookup),
  };

  if (!Number.isFinite(result.lat) || !Number.isFinite(result.lon)) {
    throw new Error("Geocoder returned invalid coordinates");
  }

  writeCache(cacheKey, result);
  return result;
}

export async function fetchMapData(bounds, options = {}) {
  const buildingBounds = options.buildingBounds ?? bounds;
  const cacheKey = `map:${boundsToCacheKey(bounds)}:buildings:${boundsToCacheKey(
    buildingBounds
  )}`;
  const cached = readCache(cacheKey, MAP_TTL_MS);
  if (cached) {
    return normalizeMapData(cached);
  }

  const query = buildOverpassQuery(bounds, buildingBounds);
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            Accept: "application/json",
          },
          body: query,
        },
        25_000
      );

      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status}`);
      }

      const payload = await response.json();
      const parsed = parseOverpassPayload(payload);
      writeCache(cacheKey, parsed);
      return normalizeMapData(parsed);
    } catch (error) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : "Failed to fetch map data";
  throw new Error(message);
}
