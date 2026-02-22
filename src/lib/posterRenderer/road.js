import { ROAD_ALIASES } from "./constants";

export function normalizeRoadType(highway) {
  if (typeof highway !== "string") {
    return "default";
  }

  const normalized = highway.trim().toLowerCase();
  return ROAD_ALIASES[normalized] ?? "default";
}

export function roadStyle(theme, highwayType, widthScale) {
  const baseStyles = {
    motorway: {
      color: theme.road_motorway,
      width: 5.2,
      priority: 5,
    },
    primary: {
      color: theme.road_primary,
      width: 4.4,
      priority: 4,
    },
    secondary: {
      color: theme.road_secondary,
      width: 3.5,
      priority: 3,
    },
    tertiary: {
      color: theme.road_tertiary,
      width: 2.7,
      priority: 2,
    },
    residential: {
      color: theme.road_residential,
      width: 2.1,
      priority: 1,
    },
    default: {
      color: theme.road_default,
      width: 2.4,
      priority: 1,
    },
  };

  const resolved = baseStyles[highwayType] ?? baseStyles.default;
  return {
    color: resolved.color || theme.road_default || theme.text,
    width: resolved.width * widthScale,
    priority: resolved.priority,
  };
}
