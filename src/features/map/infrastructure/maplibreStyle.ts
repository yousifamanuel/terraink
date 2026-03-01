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
const BUILDING_MIN_ZOOM = 13;

/* ── road width interpolation stops: [zoom, width] pairs ── */

const ROAD_PATH_WIDTHS: [number, number][] = [
  [8, 0.2],
  [14, 1],
  [18, 4],
];

const ROAD_MINOR_WIDTHS: [number, number][] = [
  [6, 0.3],
  [12, 1.5],
  [18, 8],
];

const ROAD_MAJOR_WIDTHS: [number, number][] = [
  [4, 0.5],
  [10, 2],
  [18, 12],
];

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
  options?: { includeBuildings?: boolean },
): StyleSpecification {
  const buildingFill =
    theme.building ||
    blendHex(
      theme.bg || "#ffffff",
      theme.text || "#111111",
      BUILDING_BLEND_FACTOR,
    );
  const includeBuildings = options?.includeBuildings ?? true;

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
      {
        id: "water",
        source: SOURCE_ID,
        "source-layer": "water",
        type: "fill",
        paint: { "fill-color": theme.water },
      },

      /* ── parks ── */
      {
        id: "park",
        source: SOURCE_ID,
        "source-layer": "park",
        type: "fill",
        paint: { "fill-color": theme.parks },
      },

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
              minzoom: BUILDING_MIN_ZOOM,
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
          ["tertiary", "minor", "service", "track", "path"],
          true,
          false,
        ],
        paint: {
          "line-color": theme.road_default || theme.road_tertiary || theme.text,
          "line-width": widthExpr(ROAD_PATH_WIDTHS),
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
          ["primary", "secondary"],
          true,
          false,
        ],
        paint: {
          "line-color":
            theme.road_secondary || theme.road_primary || theme.text,
          "line-width": widthExpr(ROAD_MINOR_WIDTHS),
        },
      },

      /* ── roads: major (motorway, trunk) ── */
      {
        id: "road-major",
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
        filter: ["match", ["get", "class"], ["motorway", "trunk"], true, false],
        paint: {
          "line-color": theme.road_motorway || theme.text,
          "line-width": widthExpr(ROAD_MAJOR_WIDTHS),
        },
      },
    ],
  };
}
