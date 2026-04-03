import type {
  MarkerDefaults,
  MarkerIconDefinition,
  MarkerItem,
} from "@/features/markers/domain/types";
import { DEFAULT_MARKER_SIZE } from "@/features/markers/domain/constants";
import { DEFAULT_MARKER_COLOR } from "./constants";
import { featuredMarkerIcons, predefinedMarkerIcons } from "./iconRegistry";

const CUSTOM_ICON_PREFIX = "custom-marker-icon";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultMarkerSettings(): MarkerDefaults {
  return {
    size: DEFAULT_MARKER_SIZE,
    color: DEFAULT_MARKER_COLOR,
  };
}

export function createMarkerItem(input: {
  lat: number;
  lon: number;
  defaults: MarkerDefaults;
  iconId?: string;
}): MarkerItem {
  return {
    id: createId("marker"),
    lat: input.lat,
    lon: input.lon,
    iconId: input.iconId ?? featuredMarkerIcons[0]?.id ?? predefinedMarkerIcons[0].id,
    size: input.defaults.size ?? DEFAULT_MARKER_SIZE,
    color: input.defaults.color ?? DEFAULT_MARKER_COLOR,
  };
}

export function createUploadedMarkerIcon(input: {
  label: string;
  dataUrl: string;
  tintWithMarkerColor?: boolean;
}): MarkerIconDefinition {
  return {
    id: createId(CUSTOM_ICON_PREFIX),
    label: input.label,
    source: "custom",
    kind: "image",
    dataUrl: input.dataUrl,
    tintWithMarkerColor: Boolean(input.tintWithMarkerColor),
  };
}

export function getUploadLabel(filename: string) {
  const baseName = filename.replace(/\.[^.]+$/, "").trim();
  return baseName || "Custom Marker";
}
