import {
  MAX_BUILDING_POLYGONS,
  MAX_POINTS_PER_BUILDING,
  MAX_POINTS_PER_LINE,
  MAX_POINTS_PER_POLYGON,
} from "./constants";
import {
  downsamplePoints,
  hasBuildingTag,
  hasParkTags,
  hasWaterTags,
  isClosedPolygon,
  isFiniteCoordinatePair,
  limitCollection,
  normalizeHighway,
} from "./helpers";
import type { Coordinate } from "@/shared/geo/types";
import type { RoadWay, MapData } from "../domain/types";

interface OverpassElement {
  type: string;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
}

interface OverpassPayload {
  elements?: OverpassElement[];
}

export function parseOverpassPayload(
  payload: OverpassPayload | null | undefined,
): MapData {
  const roads: RoadWay[] = [];
  const waterPolygons: Coordinate[][] = [];
  const parkPolygons: Coordinate[][] = [];
  const buildingPolygons: Coordinate[][] = [];

  const elements = Array.isArray(payload?.elements) ? payload!.elements : [];

  for (const element of elements) {
    if (element.type !== "way" && element.type !== "relation") {
      continue;
    }

    const tags = element.tags ?? {};
    const geometry = Array.isArray(element.geometry) ? element.geometry : [];
    if (geometry.length < 2) {
      continue;
    }

    const points: Coordinate[] = geometry
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
