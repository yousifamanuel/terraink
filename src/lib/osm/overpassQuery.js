import { HIGHWAY_FILTER } from "./constants";

export function buildOverpassQuery(bounds, buildingBounds) {
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
