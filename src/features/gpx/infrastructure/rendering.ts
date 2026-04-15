import type { MarkerProjectionInput } from "@/features/markers/domain/types";
import { projectMarkerToCanvas } from "@/features/markers/infrastructure/projection";
import { GPX_DASH_PATTERN } from "../domain/constants";
import type { GpxTrack } from "../domain/types";

export type GpxPointProjector = (
  lat: number,
  lon: number,
) => { x: number; y: number } | null;

interface DrawOptions {
  widthScale?: number;
}

export function drawGpxTracksWithProjector(
  ctx: CanvasRenderingContext2D,
  tracks: GpxTrack[],
  project: GpxPointProjector,
  { widthScale = 1 }: DrawOptions = {},
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const track of tracks) {
    if (!track.visible || track.segments.length === 0) continue;

    const width = Math.max(0.5, track.strokeWidth * widthScale);
    ctx.lineWidth = width;
    ctx.strokeStyle = track.color;
    ctx.globalAlpha = track.opacity;
    if (track.lineStyle === "dashed") {
      ctx.setLineDash([GPX_DASH_PATTERN[0] * width, GPX_DASH_PATTERN[1] * width]);
    } else {
      ctx.setLineDash([]);
    }

    for (const segment of track.segments) {
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

export function drawGpxTracksOnCanvas(
  ctx: CanvasRenderingContext2D,
  tracks: GpxTrack[],
  projection: MarkerProjectionInput,
  scaleX = 1,
  scaleY = 1,
): void {
  const widthScale = (scaleX + scaleY) / 2;
  drawGpxTracksWithProjector(
    ctx,
    tracks,
    (lat, lon) => {
      const { x, y } = projectMarkerToCanvas(lat, lon, projection);
      return { x: x * scaleX, y: y * scaleY };
    },
    { widthScale },
  );
}
