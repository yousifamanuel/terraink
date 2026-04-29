import type { MarkerProjectionInput } from "@/features/markers/domain/types";
import { projectMarkerToCanvas } from "@/features/markers/infrastructure/projection";
import { ROUTE_DASH_PATTERN } from "../domain/constants";
import type { Route } from "../domain/types";

export type RoutePointProjector = (
  lat: number,
  lon: number,
) => { x: number; y: number } | null;

interface DrawOptions {
  widthScale?: number;
}

export function drawRoutesWithProjector(
  ctx: CanvasRenderingContext2D,
  routes: Route[],
  project: RoutePointProjector,
  { widthScale = 1 }: DrawOptions = {},
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const route of routes) {
    if (!route.visible || route.segments.length === 0) continue;

    const width = Math.max(0.5, route.strokeWidth * widthScale);
    ctx.lineWidth = width;
    ctx.strokeStyle = route.color;
    ctx.globalAlpha = route.opacity;
    if (route.lineStyle === "dashed") {
      ctx.setLineDash([ROUTE_DASH_PATTERN[0] * width, ROUTE_DASH_PATTERN[1] * width]);
    } else {
      ctx.setLineDash([]);
    }

    for (const segment of route.segments) {
      if (segment.length < 2) continue;
      ctx.beginPath();
      let started = false;
      for (const { lat, lon } of segment) {
        const projected = project(lat, lon);
        if (!projected) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(projected.x, projected.y);
          started = true;
        } else {
          ctx.lineTo(projected.x, projected.y);
        }
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawRoutesOnCanvas(
  ctx: CanvasRenderingContext2D,
  routes: Route[],
  projection: MarkerProjectionInput,
  scaleX = 1,
  scaleY = 1,
  sizeScale = 1,
): void {
  const widthScale = ((scaleX + scaleY) / 2) * sizeScale;
  drawRoutesWithProjector(
    ctx,
    routes,
    (lat, lon) => {
      const { x, y } = projectMarkerToCanvas(lat, lon, projection);
      return { x: x * scaleX, y: y * scaleY };
    },
    { widthScale },
  );
}
