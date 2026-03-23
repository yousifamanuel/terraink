import type { ResolvedTheme } from "@/features/theme/domain/types";
import { MAP_OVERZOOM_SCALE } from "@/features/map/infrastructure/constants";
import { blendHex } from "@/shared/utils/color";
import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

const OPENFREEMAP_SOURCE = "https://tiles.openfreemap.org/planet";
const SOURCE_ID = "openfreemap";

/**
 * OpenFreeMap is OpenMapTiles-based and can generalize data at low zooms.
 * Setting maxzoom explicitly keeps high zoom behavior deterministic (standard overzoom above this level).
 */
const SOURCE_MAX_ZOOM = 14;

const BUILDING_BLEND_FACTOR = 0.14;
const BUILDING_FILL_OPACITY = 0.84;
const MAP_BUILDING_MIN_ZOOM_DEFAULT = 8;
const MAP_BUILDING_MIN_ZOOM_PRESERVE = 8.2;
const DETAIL_PRESERVE_DISTANCE_METERS = 30_000;

const MAP_WATERWAY_WIDTH_STOPS: [number, number][] = [
  [0, 0.2],
  [6, 0.34],
  [12, 0.8],
  [18, 2.4],
];

const MAP_RAIL_WIDTH_STOPS: [number, number][] = [
  [3, 0.4],
  [6, 0.7],
  [10, 1],
  [18, 1.5],
];

/**
 * Road classes are intentionally broad in minor/detail buckets so dense road texture
 * remains visible when the camera zooms out.
 */
const MAP_ROAD_MAJOR_CLASSES = ["motorway"];

const MAP_ROAD_MINOR_HIGH_CLASSES = [
  "primary",
  "primary_link",
  "secondary",
  "secondary_link",
  "motorway_link",
  "trunk",
  "trunk_link",
];

const MAP_ROAD_MINOR_MID_CLASSES = ["tertiary", "tertiary_link", "minor"];

const MAP_ROAD_MINOR_LOW_CLASSES = [
  "residential",
  "living_street",
  "unclassified",
  "road",
  "street",
  "street_limited",
  "service",
];

const MAP_ROAD_PATH_CLASSES = ["path", "pedestrian", "cycleway", "track"];
const MAP_RAIL_CLASSES = ["rail", "transit"];

/**
 * Two-stage minor/path rendering:
 * - overview layer: very thin roads at low zoom so detail does not disappear abruptly
 * - detail layer: thicker, readable network from mid zoom upward
 */
const MAP_ROAD_MINOR_HIGH_OVERVIEW_WIDTH_STOPS: [number, number][] = [
  [0, 0.1],
  [4, 0.18],
  [8, 0.3],
  [11, 0.46],
];
const MAP_ROAD_MINOR_MID_OVERVIEW_WIDTH_STOPS: [number, number][] = [
  [0, 0.08],
  [4, 0.14],
  [8, 0.24],
  [11, 0.36],
];
const MAP_ROAD_MINOR_LOW_OVERVIEW_WIDTH_STOPS: [number, number][] = [
  [0, 0.06],
  [4, 0.1],
  [8, 0.18],
  [11, 0.3],
];
const MAP_ROAD_MINOR_HIGH_DETAIL_WIDTH_STOPS: [number, number][] = [
  [6, 0.46],
  [10, 0.8],
  [14, 1.48],
  [18, 2.7],
];
const MAP_ROAD_MINOR_MID_DETAIL_WIDTH_STOPS: [number, number][] = [
  [6, 0.34],
  [10, 0.62],
  [14, 1.2],
  [18, 2.35],
];
const MAP_ROAD_MINOR_LOW_DETAIL_WIDTH_STOPS: [number, number][] = [
  [6, 0.24],
  [10, 0.44],
  [14, 0.84],
  [18, 1.65],
];

const MAP_ROAD_PATH_OVERVIEW_WIDTH_STOPS: [number, number][] = [
  [5, 0.06],
  [8, 0.1],
  [11, 0.2],
];
const MAP_ROAD_PATH_DETAIL_WIDTH_STOPS: [number, number][] = [
  [8, 0.2],
  [12, 0.42],
  [16, 0.85],
  [18, 1.3],
];

const MAP_ROAD_MAJOR_WIDTH_STOPS: [number, number][] = [
  [0, 0.36],
  [3, 0.52],
  [9, 1.1],
  [14, 2.05],
  [18, 3.3],
];

const ROAD_MINOR_OVERVIEW_MIN_ZOOM = 0;
const ROAD_MINOR_DETAIL_MIN_ZOOM = 6;
const ROAD_PATH_OVERVIEW_MIN_ZOOM = 5;
const ROAD_PATH_DETAIL_MIN_ZOOM = 8;
const ROAD_OVERVIEW_MAX_ZOOM = 11.8;

const LINE_GEOMETRY_FILTER = [
  "match",
  ["geometry-type"],
  ["LineString", "MultiLineString"],
  true,
  false,
] as const;

/**
 * Over-zoom preview/export shrinks rendered strokes after viewport scale compensation.
 * Apply a global width boost to keep perceived stroke thickness closer to non-overzoom output.
 */
const OVERZOOM_LINE_WIDTH_SCALE = Math.pow(MAP_OVERZOOM_SCALE, 0.8);

function resolveBuildingMinZoom(distanceMeters?: number): number {
  if (
    Number.isFinite(distanceMeters) &&
    Number(distanceMeters) <= DETAIL_PRESERVE_DISTANCE_METERS
  ) {
    return MAP_BUILDING_MIN_ZOOM_PRESERVE;
  }
  return MAP_BUILDING_MIN_ZOOM_DEFAULT;
}

function widthExpr(stops: [number, number][]): any {
  const flat = stops.flatMap(([zoom, width]) => [zoom, width]);
  return ["interpolate", ["linear"], ["zoom"], ...flat];
}

function opacityExpr(stops: [number, number][]): any {
  const flat = stops.flatMap(([zoom, opacity]) => [zoom, opacity]);
  return ["interpolate", ["linear"], ["zoom"], ...flat];
}

function scaledStops(
  stops: [number, number][],
  scale: number,
): [number, number][] {
  return stops.map(([zoom, width]) => [zoom, width * scale]);
}

function compensateLineWidthStops(
  stops: [number, number][],
): [number, number][] {
  return scaledStops(stops, OVERZOOM_LINE_WIDTH_SCALE);
}

function lineClassFilter(classes: string[]): any {
  return [
    "all",
    LINE_GEOMETRY_FILTER,
    ["match", ["get", "class"], classes, true, false],
  ];
}

export function generateMapStyle(
  theme: ResolvedTheme,
  options?: {
    includeBuildings?: boolean;
    includeWater?: boolean;
    includeParks?: boolean;
    includeAeroway?: boolean;
    includeRail?: boolean;
    includeRoads?: boolean;
    includeRoadPath?: boolean;
    includeRoadMinorLow?: boolean;
    includeRoadOutline?: boolean;
    distanceMeters?: number;
  },
): StyleSpecification {
  const buildingFill =
    theme.map.buildings ||
    blendHex(
      theme.map.land || "#ffffff",
      theme.ui.text || "#111111",
      BUILDING_BLEND_FACTOR,
    );

  const includeBuildings = options?.includeBuildings ?? true;
  const includeWater = options?.includeWater ?? true;
  const includeParks = options?.includeParks ?? true;
  const includeAeroway = options?.includeAeroway ?? true;
  const includeRail = options?.includeRail ?? true;
  const includeRoads = options?.includeRoads ?? true;
  const includeRoadPath = options?.includeRoadPath ?? true;
  const includeRoadMinorLow = options?.includeRoadMinorLow ?? true;
  const includeRoadOutline = options?.includeRoadOutline ?? true;
  const buildingMinZoom = resolveBuildingMinZoom(options?.distanceMeters);

  const minorHighCasingStops = scaledStops(
    MAP_ROAD_MINOR_HIGH_DETAIL_WIDTH_STOPS,
    1.45,
  );
  const minorMidCasingStops = scaledStops(
    MAP_ROAD_MINOR_MID_DETAIL_WIDTH_STOPS,
    1.15,
  );
  const pathCasingStops = scaledStops(MAP_ROAD_PATH_DETAIL_WIDTH_STOPS, 1.6);
  const majorCasingStops = scaledStops(MAP_ROAD_MAJOR_WIDTH_STOPS, 1.38);
  const waterwayWidthStops = compensateLineWidthStops(MAP_WATERWAY_WIDTH_STOPS);
  const railWidthStops = compensateLineWidthStops(MAP_RAIL_WIDTH_STOPS);
  const roadMinorOverviewHighWidthStops = compensateLineWidthStops(
    MAP_ROAD_MINOR_HIGH_OVERVIEW_WIDTH_STOPS,
  );
  const roadMinorOverviewMidWidthStops = compensateLineWidthStops(
    MAP_ROAD_MINOR_MID_OVERVIEW_WIDTH_STOPS,
  );
  const roadMinorOverviewLowWidthStops = compensateLineWidthStops(
    MAP_ROAD_MINOR_LOW_OVERVIEW_WIDTH_STOPS,
  );
  const roadPathOverviewWidthStops = compensateLineWidthStops(
    MAP_ROAD_PATH_OVERVIEW_WIDTH_STOPS,
  );
  const roadMinorDetailHighWidthStops = compensateLineWidthStops(
    MAP_ROAD_MINOR_HIGH_DETAIL_WIDTH_STOPS,
  );
  const roadMinorDetailMidWidthStops = compensateLineWidthStops(
    MAP_ROAD_MINOR_MID_DETAIL_WIDTH_STOPS,
  );
  const roadMinorDetailLowWidthStops = compensateLineWidthStops(
    MAP_ROAD_MINOR_LOW_DETAIL_WIDTH_STOPS,
  );
  const roadPathDetailWidthStops = compensateLineWidthStops(
    MAP_ROAD_PATH_DETAIL_WIDTH_STOPS,
  );
  const roadMajorWidthStops = compensateLineWidthStops(
    MAP_ROAD_MAJOR_WIDTH_STOPS,
  );
  const roadMinorHighCasingStops =
    compensateLineWidthStops(minorHighCasingStops);
  const roadMinorMidCasingStops = compensateLineWidthStops(minorMidCasingStops);
  const roadPathCasingStops = compensateLineWidthStops(pathCasingStops);
  const roadMajorCasingStops = compensateLineWidthStops(majorCasingStops);
  const roadMinorHighColor = theme.map.roads.minor_high;
  const roadMinorMidColor = theme.map.roads.minor_mid;
  const roadMinorLowColor = theme.map.roads.minor_low;
  const roadPathColor = theme.map.roads.path;
  const roadOutlineColor = theme.map.roads.outline;

  return {
    version: 8,
    sources: {
      [SOURCE_ID]: {
        type: "vector",
        url: OPENFREEMAP_SOURCE,
        maxzoom: SOURCE_MAX_ZOOM,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": theme.map.land },
      },

      // Parks are drawn before water so that marine protected areas / ocean parks
      // are always covered by the water layer and don't bleed the parks color onto oceans.
      ...(includeParks
        ? [
            {
              id: "park",
              source: SOURCE_ID,
              "source-layer": "park",
              type: "fill" as const,
              paint: { "fill-color": theme.map.parks },
            },
          ]
        : []),

      ...(includeWater
        ? [
            {
              id: "water",
              source: SOURCE_ID,
              "source-layer": "water",
              type: "fill" as const,
              paint: { "fill-color": theme.map.water },
            },
            {
              id: "waterway",
              source: SOURCE_ID,
              "source-layer": "waterway",
              type: "line" as const,
              filter: lineClassFilter(["river", "canal", "stream", "ditch"]),
              paint: {
                "line-color": theme.map.waterway,
                "line-width": widthExpr(waterwayWidthStops),
              },
              layout: {
                "line-cap": "round",
                "line-join": "round",
              },
            },
          ]
        : []),

      ...(includeAeroway
        ? [
            {
              id: "aeroway",
              source: SOURCE_ID,
              "source-layer": "aeroway",
              type: "fill" as const,
              filter: [
                "match",
                ["geometry-type"],
                ["MultiPolygon", "Polygon"],
                true,
                false,
              ],
              paint: {
                "fill-color": theme.map.aeroway,
                "fill-opacity": 0.85,
              },
            },
          ]
        : []),

      ...(includeBuildings
        ? [
            {
              id: "building",
              source: SOURCE_ID,
              "source-layer": "building",
              type: "fill" as const,
              minzoom: buildingMinZoom,
              paint: {
                "fill-color": buildingFill,
                "fill-opacity": BUILDING_FILL_OPACITY,
              },
            },
          ]
        : []),

      ...(includeRail
        ? [
            {
              id: "rail",
              source: SOURCE_ID,
              "source-layer": "transportation",
              type: "line" as const,
              filter: lineClassFilter(MAP_RAIL_CLASSES),
              paint: {
                "line-color": theme.map.rail,
                "line-width": widthExpr(railWidthStops),
                "line-opacity": opacityExpr([
                  [0, 0.56],
                  [12, 0.62],
                  [18, 0.72],
                ]),
                "line-dasharray": [2, 1.6],
              },
              layout: {
                "line-cap": "round",
                "line-join": "round",
              },
            },
          ]
        : []),

      ...(includeRoads
        ? [{
        id: "road-minor-overview-high",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_OVERVIEW_MIN_ZOOM,
        maxzoom: ROAD_OVERVIEW_MAX_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_HIGH_CLASSES),
        paint: {
          "line-color": roadMinorHighColor,
          "line-width": widthExpr(roadMinorOverviewHighWidthStops),
          "line-opacity": opacityExpr([
            [0, 0.66],
            [8, 0.76],
            [12, 0],
          ]),
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-minor-overview-mid",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_OVERVIEW_MIN_ZOOM,
        maxzoom: ROAD_OVERVIEW_MAX_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_MID_CLASSES),
        paint: {
          "line-color": roadMinorMidColor,
          "line-width": widthExpr(roadMinorOverviewMidWidthStops),
          "line-opacity": opacityExpr([
            [0, 0.46],
            [8, 0.56],
            [12, 0],
          ]),
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-minor-overview-low",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_OVERVIEW_MIN_ZOOM,
        maxzoom: ROAD_OVERVIEW_MAX_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_LOW_CLASSES),
        paint: {
          "line-color": roadMinorLowColor,
          "line-width": widthExpr(roadMinorOverviewLowWidthStops),
          "line-opacity": includeRoadMinorLow
            ? opacityExpr([
                [0, 0.26],
                [8, 0.34],
                [12, 0],
              ])
            : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-path-overview",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_PATH_OVERVIEW_MIN_ZOOM,
        maxzoom: ROAD_OVERVIEW_MAX_ZOOM,
        filter: lineClassFilter(MAP_ROAD_PATH_CLASSES),
        paint: {
          "line-color": roadPathColor,
          "line-width": widthExpr(roadPathOverviewWidthStops),
          "line-opacity": includeRoadPath
            ? opacityExpr([
                [5, 0.45],
                [9, 0.58],
                [12, 0],
              ])
            : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },

      {
        id: "road-major-casing",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        filter: lineClassFilter(MAP_ROAD_MAJOR_CLASSES),
        paint: {
          "line-color": roadOutlineColor,
          "line-width": widthExpr(roadMajorCasingStops),
          "line-opacity": includeRoadOutline ? 0.95 : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-minor-high-casing",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_DETAIL_MIN_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_HIGH_CLASSES),
        paint: {
          "line-color": roadOutlineColor,
          "line-width": widthExpr(roadMinorHighCasingStops),
          "line-opacity": includeRoadOutline
            ? opacityExpr([
                [6, 0.72],
                [12, 0.85],
                [18, 0.92],
              ])
            : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-minor-mid-casing",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_DETAIL_MIN_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_MID_CLASSES),
        paint: {
          "line-color": roadOutlineColor,
          "line-width": widthExpr(roadMinorMidCasingStops),
          "line-opacity": includeRoadOutline
            ? opacityExpr([
                [6, 0.42],
                [12, 0.56],
                [18, 0.66],
              ])
            : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-path-casing",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_PATH_DETAIL_MIN_ZOOM,
        filter: lineClassFilter(MAP_ROAD_PATH_CLASSES),
        paint: {
          "line-color": roadOutlineColor,
          "line-width": widthExpr(roadPathCasingStops),
          "line-opacity": includeRoadOutline && includeRoadPath
            ? opacityExpr([
                [8, 0.62],
                [12, 0.72],
                [18, 0.85],
              ])
            : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },

      {
        id: "road-major",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        filter: lineClassFilter(MAP_ROAD_MAJOR_CLASSES),
        paint: {
          "line-color": theme.map.roads.major,
          "line-width": widthExpr(roadMajorWidthStops),
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-minor-high",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_DETAIL_MIN_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_HIGH_CLASSES),
        paint: {
          "line-color": roadMinorHighColor,
          "line-width": widthExpr(roadMinorDetailHighWidthStops),
          "line-opacity": opacityExpr([
            [6, 0.84],
            [10, 0.92],
            [18, 1],
          ]),
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-minor-mid",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_DETAIL_MIN_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_MID_CLASSES),
        paint: {
          "line-color": roadMinorMidColor,
          "line-width": widthExpr(roadMinorDetailMidWidthStops),
          "line-opacity": opacityExpr([
            [6, 0.62],
            [10, 0.74],
            [18, 0.86],
          ]),
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-minor-low",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_MINOR_DETAIL_MIN_ZOOM,
        filter: lineClassFilter(MAP_ROAD_MINOR_LOW_CLASSES),
        paint: {
          "line-color": roadMinorLowColor,
          "line-width": widthExpr(roadMinorDetailLowWidthStops),
          "line-opacity": includeRoadMinorLow
            ? opacityExpr([
                [6, 0.34],
                [10, 0.46],
                [18, 0.58],
              ])
            : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      },
      {
        id: "road-path",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        minzoom: ROAD_PATH_DETAIL_MIN_ZOOM,
        filter: lineClassFilter(MAP_ROAD_PATH_CLASSES),
        paint: {
          "line-color": roadPathColor,
          "line-width": widthExpr(roadPathDetailWidthStops),
          "line-opacity": includeRoadPath
            ? opacityExpr([
                [8, 0.7],
                [12, 0.82],
                [18, 0.95],
              ])
            : 0,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      }]
        : []),
    ] as LayerSpecification[],
  };
}
