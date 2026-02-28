import { HIGHWAY_FILTER } from "./constants";
import type { Bounds } from "@/shared/geo/types";

export function buildOverpassQuery(
  bounds: Bounds,
  buildingBounds: Bounds,
): string {
  const s = bounds.south.toFixed(6);
  const w = bounds.west.toFixed(6);
  const n = bounds.north.toFixed(6);
  const e = bounds.east.toFixed(6);
  const bs = buildingBounds.south.toFixed(6);
  const bw = buildingBounds.west.toFixed(6);
  const bn = buildingBounds.north.toFixed(6);
  const be = buildingBounds.east.toFixed(6);

  return `
[out:json][timeout:25];
(
  way["highway"~"${HIGHWAY_FILTER}"](${s},${w},${n},${e});
  way["natural"~"water|bay|strait"](${s},${w},${n},${e});
  way["waterway"="riverbank"](${s},${w},${n},${e});
  way["leisure"="park"](${s},${w},${n},${e});
  way["landuse"="grass"](${s},${w},${n},${e});
  way["building"](${bs},${bw},${bn},${be});
  relation["building"](${bs},${bw},${bn},${be});
);
out geom qt;
`.trim();
}
