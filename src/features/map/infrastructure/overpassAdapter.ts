import type { ICache } from "@/core/cache/ports";
import type { IHttp } from "@/core/http/ports";
import type { IMapDataPort, MapData } from "../domain/types";
import type { Bounds } from "@/shared/geo/types";
import { MAP_TTL_MS, OVERPASS_ENDPOINTS } from "./constants";
import { getMapCacheKey } from "./cacheKeys";
import { normalizeMapData } from "./helpers";
import { buildOverpassQuery } from "./overpassQuery";
import { parseOverpassPayload } from "./overpassParser";

export function createOverpassAdapter(
  http: IHttp,
  cache: ICache,
): IMapDataPort {
  async function fetchMapData(
    bounds: Bounds,
    options: { buildingBounds?: Bounds } = {},
  ): Promise<MapData> {
    const buildingBounds = options.buildingBounds ?? bounds;
    const cacheKey = getMapCacheKey(bounds, buildingBounds);
    const cached = cache.read<MapData>(cacheKey, MAP_TTL_MS);
    if (cached) {
      return normalizeMapData(cached);
    }

    const query = buildOverpassQuery(bounds, buildingBounds);
    let lastError: unknown = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const payload = await http.post(
          endpoint,
          query,
          {
            headers: {
              "Content-Type": "text/plain;charset=UTF-8",
              Accept: "application/json",
            },
          },
          25_000,
        );

        const data = await payload.json();
        const parsed = parseOverpassPayload(data);
        cache.write(cacheKey, parsed);
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

  return { fetchMapData };
}
