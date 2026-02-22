export function normalizeMapData(data) {
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

export function isFiniteCoordinatePair(point) {
  return (
    point &&
    typeof point.lat === "number" &&
    typeof point.lon === "number" &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon)
  );
}

export function isClosedPolygon(points) {
  if (points.length < 4) {
    return false;
  }

  const first = points[0];
  const last = points[points.length - 1];

  return (
    Math.abs(first.lat - last.lat) < 1e-6 && Math.abs(first.lon - last.lon) < 1e-6
  );
}

export function normalizeHighway(highway) {
  if (Array.isArray(highway)) {
    return String(highway[0] ?? "unclassified");
  }

  if (typeof highway === "string" && highway.trim().length > 0) {
    return highway.split(";")[0].trim();
  }

  return "unclassified";
}

export function hasWaterTags(tags) {
  const naturalTag = String(tags.natural ?? "");
  const waterwayTag = String(tags.waterway ?? "");

  return (
    naturalTag === "water" ||
    naturalTag === "bay" ||
    naturalTag === "strait" ||
    waterwayTag === "riverbank"
  );
}

export function hasParkTags(tags) {
  const leisureTag = String(tags.leisure ?? "");
  const landuseTag = String(tags.landuse ?? "");
  return leisureTag === "park" || landuseTag === "grass";
}

export function hasBuildingTag(tags) {
  if (!tags || typeof tags !== "object") {
    return false;
  }

  if (!("building" in tags)) {
    return false;
  }

  const value = String(tags.building ?? "").trim().toLowerCase();
  return value !== "no";
}

export function downsamplePoints(points, maxPoints) {
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

export function limitCollection(items, maxItems) {
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

export function pickFirstAddressValue(address, keys) {
  if (!address || typeof address !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = address[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}
