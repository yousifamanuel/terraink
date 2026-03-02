import type { ResolvedTheme } from "@/features/theme/domain/types";
import { blendHex } from "@/shared/utils/color";
import type { StyleSpecification } from "maplibre-gl";

/* ── tile source ── */

const OPENFREEMAP_SOURCE = "https://tiles.openfreemap.org/planet";
const SOURCE_ID = "openfreemap";

/* ── building style constants ── */

/** Blend factor for deriving building fill when `theme.building` is unset. */
const BUILDING_BLEND_FACTOR = 0.14;
const BUILDING_FILL_OPACITY = 0.85;
const MAP_BUILDING_MIN_ZOOM_DEFAULT = 13;
const MAP_BUILDING_MIN_ZOOM_PRESERVE = 8.2;
const DETAIL_PRESERVE_DISTANCE_METERS = 30_000;

const MAP_ROAD_PATH_ZOOM_MIN = 0;
const MAP_ROAD_PATH_ZOOM_LOW = 6;
const MAP_ROAD_PATH_ZOOM_MID = 14;
const MAP_ROAD_PATH_ZOOM_HIGH = 18;

const MAP_ROAD_MINOR_ZOOM_MIN = 0;
const MAP_ROAD_MINOR_ZOOM_LOW = 4;
const MAP_ROAD_MINOR_ZOOM_MID = 12;
const MAP_ROAD_MINOR_ZOOM_HIGH = 18;

const MAP_ROAD_MAJOR_ZOOM_MIN = 0;
const MAP_ROAD_MAJOR_ZOOM_LOW = 2;
const MAP_ROAD_MAJOR_ZOOM_MID = 10;
const MAP_ROAD_MAJOR_ZOOM_HIGH = 18;

const MAP_ROAD_PATH_CLASSES = [
  "tertiary",
  "tertiary_link",
  "minor",
  "residential",
  "living_street",
  "unclassified",
  "road",
  "street",
  "street_limited",
  "service",
  "track",
  "path",
];

const MAP_ROAD_MINOR_CLASSES = [
  "primary",
  "primary_link",
  "secondary",
  "secondary_link",
];

const MAP_ROAD_MAJOR_CLASSES = [
  "motorway",
  "motorway_link",
  "trunk",
  "trunk_link",
];

const MAP_ROAD_PATH_WIDTH_STOPS: [number, number][] = [
  [MAP_ROAD_PATH_ZOOM_MIN, 0.16],
  [MAP_ROAD_PATH_ZOOM_LOW, 0.18],
  [MAP_ROAD_PATH_ZOOM_MID, 0.38],
  [MAP_ROAD_PATH_ZOOM_HIGH, 0.9],
];

const MAP_ROAD_MINOR_WIDTH_STOPS: [number, number][] = [
  [MAP_ROAD_MINOR_ZOOM_MIN, 0.22],
  [MAP_ROAD_MINOR_ZOOM_LOW, 0.24],
  [MAP_ROAD_MINOR_ZOOM_MID, 0.58],
  [MAP_ROAD_MINOR_ZOOM_HIGH, 1.9],
];

const MAP_ROAD_MAJOR_WIDTH_STOPS: [number, number][] = [
  [MAP_ROAD_MAJOR_ZOOM_MIN, 0.34],
  [MAP_ROAD_MAJOR_ZOOM_LOW, 0.34],
  [MAP_ROAD_MAJOR_ZOOM_MID, 0.74],
  [MAP_ROAD_MAJOR_ZOOM_HIGH, 2.6],
];

function resolveBuildingMinZoom(distanceMeters?: number): number {
  if (
    Number.isFinite(distanceMeters) &&
    Number(distanceMeters) <= DETAIL_PRESERVE_DISTANCE_METERS
  ) {
    return MAP_BUILDING_MIN_ZOOM_PRESERVE;
  }
  return MAP_BUILDING_MIN_ZOOM_DEFAULT;
}

/** Build a MapLibre interpolation expression from zoom↔width pairs. */
function widthExpr(
  stops: [number, number][],
): ["interpolate", ["linear"], ["zoom"], ...number[]] {
  const flat = stops.flatMap(([z, w]) => [z, w]);
  return ["interpolate", ["linear"], ["zoom"], ...flat];
}

/**
 * Generates a full MapLibre GL style from a resolved TerraInk theme.
 *
 * Source: OpenFreeMap (OSM-based vector tiles, free, no API key).
 * Layers (bottom → top): background, water, park, building,
 * road-path, road-minor, road-major.
 */
export function generateMapStyle(
  theme: ResolvedTheme,
  options?: {
    includeBuildings?: boolean;
    includeWater?: boolean;
    includeParks?: boolean;
    distanceMeters?: number;
  },
): StyleSpecification {
  const buildingFill =
    theme.building ||
    blendHex(
      theme.bg || "#ffffff",
      theme.text || "#111111",
      BUILDING_BLEND_FACTOR,
    );
  const includeBuildings = options?.includeBuildings ?? true;
  const includeWater = options?.includeWater ?? true;
  const includeParks = options?.includeParks ?? true;
  const buildingMinZoom = resolveBuildingMinZoom(options?.distanceMeters);

  return {
    version: 8,
    sources: {
      [SOURCE_ID]: {
        type: "vector",
        url: OPENFREEMAP_SOURCE,
      },
    },
    layers: [
      /* ── background (terrain / land fill) ── */
      {
        id: "background",
        type: "background",
        paint: { "background-color": theme.bg },
      },

      /* ── water ── */
      ...(includeWater
        ? [
            {
              id: "water",
              source: SOURCE_ID,
              "source-layer": "water",
              type: "fill" as const,
              paint: { "fill-color": theme.water },
            },
          ]
        : []),

      /* ── parks ── */
      ...(includeParks
        ? [
            {
              id: "park",
              source: SOURCE_ID,
              "source-layer": "park",
              type: "fill" as const,
              paint: { "fill-color": theme.parks },
            },
          ]
        : []),

      ...(includeBuildings
        ? [
            /* ── buildings ── */
            {
              id: "building",
              source: SOURCE_ID,
              "source-layer": "building",
              type: "fill" as const,
              paint: {
                "fill-color": buildingFill,
                "fill-opacity": BUILDING_FILL_OPACITY,
              },
              minzoom: buildingMinZoom,
            },
          ]
        : []),

      /* ── roads: paths (tertiary, residential, pedestrian, service) ── */
      {
        id: "road-path",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        filter: [
          "match",
          ["get", "class"],
          MAP_ROAD_PATH_CLASSES,
          true,
          false,
        ],
        paint: {
          "line-color": theme.road_default || theme.road_tertiary || theme.text,
          "line-width": widthExpr(MAP_ROAD_PATH_WIDTH_STOPS),
        },
      },

      /* ── roads: minor (primary, secondary) ── */
      {
        id: "road-minor",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        filter: [
          "match",
          ["get", "class"],
          MAP_ROAD_MINOR_CLASSES,
          true,
          false,
        ],
        paint: {
          "line-color":
            theme.road_secondary || theme.road_primary || theme.text,
          "line-width": widthExpr(MAP_ROAD_MINOR_WIDTH_STOPS),
        },
      },

      /* ── roads: major (motorway, trunk) ── */
      {
        id: "road-major",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        filter: [
          "match",
          ["get", "class"],
          MAP_ROAD_MAJOR_CLASSES,
          true,
          false,
        ],
        paint: {
          "line-color": theme.road_motorway || theme.text,
          "line-width": widthExpr(MAP_ROAD_MAJOR_WIDTH_STOPS),
        },
      },
    ],
  };
}
