import { withAlpha } from "@/shared/utils/color";
import {
  DOUBLE_LINE_GAP,
  type PosterStyleTemplate,
} from "@/features/poster/domain/posterStyleTemplates";

export function applyFades(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  template: PosterStyleTemplate,
): void {
  const { fade } = template;

  const offset = height * (fade.offsetY ?? 0);

  if (fade.top) {
    const topHeight = height * fade.top;
    const topGradient = ctx.createLinearGradient(0, offset, 0, offset + topHeight);
    topGradient.addColorStop(0, withAlpha(color, 1));
    topGradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, offset, width, topHeight);
  }

  if (fade.bottom) {
    const bottomHeight = height * fade.bottom;
    const bottomEdge = height - offset;
    const bottomGradient = ctx.createLinearGradient(
      0,
      bottomEdge,
      0,
      bottomEdge - bottomHeight,
    );
    bottomGradient.addColorStop(0, withAlpha(color, 1));
    bottomGradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, bottomEdge - bottomHeight, width, bottomHeight);
  }

  if (fade.left) {
    const leftWidth = width * fade.left;
    const leftGradient = ctx.createLinearGradient(0, 0, leftWidth, 0);
    leftGradient.addColorStop(0, withAlpha(color, 1));
    leftGradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = leftGradient;
    ctx.fillRect(0, 0, leftWidth, height);
  }

  if (fade.right) {
    const rightWidth = width * fade.right;
    const rightGradient = ctx.createLinearGradient(
      width,
      0,
      width - rightWidth,
      0,
    );
    rightGradient.addColorStop(0, withAlpha(color, 1));
    rightGradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = rightGradient;
    ctx.fillRect(width - rightWidth, 0, rightWidth, height);
  }
}

/**
 * Border: fills the band between the poster edge and the frame with the
 * background color (no map there), then draws one thin line. The band is
 * equally wide on all sides (share of the shorter side).
 */
export function drawTemplateFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lineColor: string,
  backgroundColor: string,
  template: PosterStyleTemplate,
): void {
  const { frame } = template;
  if (frame.type === "none") return;

  const short = Math.min(width, height);
  const inset = short * frame.inset;
  const lineWidth = Math.max(1, short * (frame.thickness ?? 0.0025));

  ctx.save();
  if (frame.type === "mat") {
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.rect(inset, inset, width - inset * 2, height - inset * 2);
    ctx.fill("evenodd");
  }
  ctx.strokeStyle = withAlpha(lineColor, frame.alpha);
  ctx.lineWidth = lineWidth;
  if (frame.dash === "dashed") ctx.setLineDash([lineWidth * 4, lineWidth * 3]);
  // The main line is drawn inward from the frame edge; a double border adds
  // a second line outside it, in the band (never past the poster edge).
  const lines =
    frame.line === "double"
      ? [inset, Math.max(0, inset - lineWidth * (1 + DOUBLE_LINE_GAP))]
      : [inset];
  for (const at of lines) {
    const half = lineWidth / 2;
    ctx.strokeRect(at + half, at + half, width - (at + half) * 2, height - (at + half) * 2);
  }
  ctx.restore();
}
