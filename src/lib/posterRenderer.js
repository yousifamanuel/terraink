import { formatCoordinates } from "./geo";

const OUTPUT_DPI = 220;
const MAX_PIXELS = 8_500_000;
const MAX_SIDE = 4096;

const ROAD_ALIASES = {
  motorway: "motorway",
  motorway_link: "motorway",
  trunk: "primary",
  trunk_link: "primary",
  primary: "primary",
  primary_link: "primary",
  secondary: "secondary",
  secondary_link: "secondary",
  tertiary: "tertiary",
  tertiary_link: "tertiary",
  residential: "residential",
  living_street: "residential",
  unclassified: "residential",
};

function parseHex(hex) {
  if (typeof hex !== "string") {
    return null;
  }

  let normalized = hex.trim().replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function withAlpha(hex, alpha) {
  const rgb = parseHex(hex);
  if (!rgb) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function blendHex(hexA, hexB, weight = 0.5) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  if (!a && !b) {
    return "#888888";
  }
  if (!a) {
    return hexB;
  }
  if (!b) {
    return hexA;
  }

  const t = Math.min(Math.max(weight, 0), 1);
  const mix = (from, to) => Math.round(from * (1 - t) + to * t);
  const r = mix(a.r, b.r).toString(16).padStart(2, "0");
  const g = mix(a.g, b.g).toString(16).padStart(2, "0");
  const bChannel = mix(a.b, b.b).toString(16).padStart(2, "0");
  return `#${r}${g}${bChannel}`;
}

function mercatorY(lat) {
  const clamped = Math.max(-85, Math.min(85, lat));
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

function createProjector(bounds, width, height) {
  const eastWestSpan = bounds.east - bounds.west || 1e-9;
  const northMerc = mercatorY(bounds.north);
  const southMerc = mercatorY(bounds.south);
  const mercSpan = northMerc - southMerc || 1e-9;

  return (point) => {
    const x = ((point.lon - bounds.west) / eastWestSpan) * width;
    const y = ((northMerc - mercatorY(point.lat)) / mercSpan) * height;
    return { x, y };
  };
}

function pointsIntersectBounds(points, bounds) {
  if (!Array.isArray(points) || points.length === 0) {
    return false;
  }

  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    if (
      !point ||
      typeof point.lat !== "number" ||
      typeof point.lon !== "number" ||
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lon)
    ) {
      continue;
    }

    if (point.lat < minLat) minLat = point.lat;
    if (point.lat > maxLat) maxLat = point.lat;
    if (point.lon < minLon) minLon = point.lon;
    if (point.lon > maxLon) maxLon = point.lon;
  }

  if (
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat) ||
    !Number.isFinite(minLon) ||
    !Number.isFinite(maxLon)
  ) {
    return false;
  }

  return !(
    maxLon < bounds.west ||
    minLon > bounds.east ||
    maxLat < bounds.south ||
    minLat > bounds.north
  );
}

function roadStyle(theme, highwayType, widthScale) {
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

function normalizeRoadType(highway) {
  if (typeof highway !== "string") {
    return "default";
  }

  const normalized = highway.trim().toLowerCase();
  return ROAD_ALIASES[normalized] ?? "default";
}

function drawPolygonLayer(ctx, polygons, projector, color, bounds) {
  if (!Array.isArray(polygons) || polygons.length === 0) {
    return;
  }

  ctx.fillStyle = color;
  for (const polygon of polygons) {
    if (!Array.isArray(polygon) || polygon.length < 3) {
      continue;
    }
    if (!pointsIntersectBounds(polygon, bounds)) {
      continue;
    }

    const first = projector(polygon[0]);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);

    for (let index = 1; index < polygon.length; index += 1) {
      const point = projector(polygon[index]);
      ctx.lineTo(point.x, point.y);
    }

    ctx.closePath();
    ctx.fill();
  }
}

function polygonArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area) * 0.5;
}

function drawBuildingLayer(ctx, polygons, projector, theme, bounds, widthScale) {
  if (!Array.isArray(polygons) || polygons.length === 0) {
    return;
  }

  const fillColor =
    theme.building || blendHex(theme.bg || "#ffffff", theme.text || "#111111", 0.14);
  const strokeColor =
    theme.building_stroke ||
    blendHex(theme.bg || "#ffffff", theme.text || "#111111", 0.26);
  const strokeWidth = Math.max(0.45, 0.8 * widthScale);

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = "round";

  for (const polygon of polygons) {
    if (!Array.isArray(polygon) || polygon.length < 3) {
      continue;
    }
    if (!pointsIntersectBounds(polygon, bounds)) {
      continue;
    }

    const projected = polygon.map(projector);
    if (polygonArea(projected) < 5) {
      continue;
    }

    const first = projected[0];
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let index = 1; index < projected.length; index += 1) {
      const point = projected[index];
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawRoadLayer(ctx, roads, projector, theme, widthScale, bounds) {
  if (!Array.isArray(roads) || roads.length === 0) {
    return;
  }

  const sortedRoads = roads
    .map((road) => {
      const roadType = normalizeRoadType(road.highway);
      return {
        ...road,
        style: roadStyle(theme, roadType, widthScale),
      };
    })
    .sort((a, b) => a.style.priority - b.style.priority);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (const road of sortedRoads) {
    if (!Array.isArray(road.points) || road.points.length < 2) {
      continue;
    }
    if (!pointsIntersectBounds(road.points, bounds)) {
      continue;
    }

    const first = projector(road.points[0]);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);

    for (let index = 1; index < road.points.length; index += 1) {
      const point = projector(road.points[index]);
      ctx.lineTo(point.x, point.y);
    }

    ctx.strokeStyle = road.style.color;
    ctx.lineWidth = road.style.width;
    ctx.stroke();
  }
}

function applyFades(ctx, width, height, color) {
  const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.25);
  topGradient.addColorStop(0, withAlpha(color, 1));
  topGradient.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, width, height * 0.25);

  const bottomGradient = ctx.createLinearGradient(0, height, 0, height * 0.75);
  bottomGradient.addColorStop(0, withAlpha(color, 1));
  bottomGradient.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, height * 0.75, width, height * 0.25);
}

function isLatinScript(text) {
  if (!text) {
    return true;
  }

  let latinCount = 0;
  let alphaCount = 0;

  for (const char of text) {
    if (/[A-Za-z\u00C0-\u024F]/.test(char)) {
      latinCount += 1;
      alphaCount += 1;
    } else if (/\p{L}/u.test(char)) {
      alphaCount += 1;
    }
  }

  if (alphaCount === 0) {
    return true;
  }

  return latinCount / alphaCount > 0.8;
}

function drawPosterText(
  ctx,
  width,
  height,
  theme,
  center,
  city,
  country,
  fontFamily
) {
  const textColor = theme.text || "#111111";
  const titleFontFamily = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : `"Space Grotesk", sans-serif`;
  const bodyFontFamily = fontFamily
    ? `"${fontFamily}", "IBM Plex Mono", monospace`
    : `"IBM Plex Mono", monospace`;

  const dimScale = Math.max(0.45, Math.min(width, height) / 3600);

  const cityLabel = isLatinScript(city)
    ? city.toUpperCase().split("").join("  ")
    : city;
  const cityLength = Math.max(city.length, 1);

  let cityFontSize = 250 * dimScale;
  if (cityLength > 10) {
    cityFontSize = Math.max(110 * dimScale, cityFontSize * (10 / cityLength));
  }

  const countryFontSize = 92 * dimScale;
  const coordinateFontSize = 58 * dimScale;
  const attributionFontSize = 30 * dimScale;

  const cityY = height * 0.86;
  const lineY = height * 0.875;
  const countryY = height * 0.9;
  const coordinatesY = height * 0.93;

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${cityFontSize}px ${titleFontFamily}`;
  ctx.fillText(cityLabel, width * 0.5, cityY);

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 3 * dimScale;
  ctx.beginPath();
  ctx.moveTo(width * 0.4, lineY);
  ctx.lineTo(width * 0.6, lineY);
  ctx.stroke();

  ctx.font = `300 ${countryFontSize}px ${titleFontFamily}`;
  ctx.fillText(country.toUpperCase(), width * 0.5, countryY);

  ctx.globalAlpha = 0.75;
  ctx.font = `400 ${coordinateFontSize}px ${bodyFontFamily}`;
  ctx.fillText(
    formatCoordinates(center.lat, center.lon),
    width * 0.5,
    coordinatesY
  );
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.55;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.font = `300 ${attributionFontSize}px ${bodyFontFamily}`;
  ctx.fillText("© OpenStreetMap contributors", width * 0.98, height * 0.98);
  ctx.globalAlpha = 1;
}

function resolveCanvasSize(widthInches, heightInches) {
  const requestedWidth = Math.max(600, Math.round(widthInches * OUTPUT_DPI));
  const requestedHeight = Math.max(600, Math.round(heightInches * OUTPUT_DPI));
  const totalPixels = requestedWidth * requestedHeight;
  const areaFactor =
    totalPixels > MAX_PIXELS ? Math.sqrt(MAX_PIXELS / totalPixels) : 1;
  const sideFactor =
    Math.max(requestedWidth, requestedHeight) > MAX_SIDE
      ? MAX_SIDE / Math.max(requestedWidth, requestedHeight)
      : 1;
  const factor = Math.min(areaFactor, sideFactor, 1);
  const width = Math.max(600, Math.round(requestedWidth * factor));
  const height = Math.max(600, Math.round(requestedHeight * factor));

  return {
    width,
    height,
    requestedWidth,
    requestedHeight,
    downscaleFactor: factor,
  };
}

export function renderPoster(canvas, options) {
  const {
    theme,
    mapData,
    bounds,
    center,
    widthInches,
    heightInches,
    displayCity,
    displayCountry,
    fontFamily,
  } = options;

  const size = resolveCanvasSize(widthInches, heightInches);
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas rendering is not available.");
  }

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size.width, size.height);

  const projector = createProjector(bounds, size.width, size.height);

  drawPolygonLayer(ctx, mapData.waterPolygons, projector, theme.water, bounds);
  drawPolygonLayer(ctx, mapData.parkPolygons, projector, theme.parks, bounds);
  drawBuildingLayer(
    ctx,
    mapData.buildingPolygons,
    projector,
    theme,
    bounds,
    Math.max(0.7, Math.min(size.width, size.height) / 3600)
  );

  const roadWidthScale = Math.max(0.7, Math.min(size.width, size.height) / 3600);
  drawRoadLayer(ctx, mapData.roads, projector, theme, roadWidthScale, bounds);

  applyFades(ctx, size.width, size.height, theme.gradient_color);
  drawPosterText(
    ctx,
    size.width,
    size.height,
    theme,
    center,
    displayCity,
    displayCountry,
    fontFamily
  );

  return size;
}
