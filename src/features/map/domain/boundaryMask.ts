/**
 * MapLibre cannot clip vector layers to an arbitrary polygon, so restricting a
 * poster to one administrative area is done by painting everything *outside*
 * it: a world-sized ring with the boundary rings punched out as holes.
 *
 * The map data outside the boundary is still fetched, only hidden — filtering
 * at tile level would require geometry operations the renderer does not expose.
 */

/** Web Mercator cuts off just past +/-85 degrees, so the ring stops there. */
const WORLD_LATITUDE_LIMIT = 85.0511;

const WORLD_RING: number[][] = [
  [-180, -WORLD_LATITUDE_LIMIT],
  [180, -WORLD_LATITUDE_LIMIT],
  [180, WORLD_LATITUDE_LIMIT],
  [-180, WORLD_LATITUDE_LIMIT],
  [-180, -WORLD_LATITUDE_LIMIT],
];

export interface BoundaryMaskFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export function createBoundaryMask(
  rings: number[][][] | null | undefined,
): BoundaryMaskFeature | null {
  if (!Array.isArray(rings) || rings.length === 0) {
    return null;
  }

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [WORLD_RING, ...rings],
    },
  };
}
