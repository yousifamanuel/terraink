import type { Bounds } from "@/shared/geo/types";

export interface RoadWay {
  highway: string;
  points: Array<{ lat: number; lon: number }>;
}

export interface MapData {
  roads: RoadWay[];
  waterPolygons: Array<Array<{ lat: number; lon: number }>>;
  parkPolygons: Array<Array<{ lat: number; lon: number }>>;
  buildingPolygons: Array<Array<{ lat: number; lon: number }>>;
}

export interface IMapDataPort {
  fetchMapData(
    bounds: Bounds,
    options?: { buildingBounds?: Bounds },
  ): Promise<MapData>;
}
