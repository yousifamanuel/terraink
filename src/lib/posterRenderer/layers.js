import { blendHex, withAlpha } from "./colors";
import { pointsIntersectBounds, polygonArea } from "./projection";
import { normalizeRoadType, roadStyle } from "./road";

export function drawPolygonLayer(ctx, polygons, projector, color, bounds) {
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

export function drawBuildingLayer(ctx, polygons, projector, theme, bounds, widthScale) {
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

export function drawRoadLayer(ctx, roads, projector, theme, widthScale, bounds) {
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

export function applyFades(ctx, width, height, color) {
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
