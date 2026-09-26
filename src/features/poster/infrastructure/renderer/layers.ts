import { withAlpha } from "@/shared/utils/color";
import type { PosterStyleTemplate } from "@/features/poster/domain/posterStyleTemplates";

export function applyFades(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  template: PosterStyleTemplate,
): void {
  const { fade } = template;

  if (fade.top) {
    const topHeight = height * fade.top;
    const topGradient = ctx.createLinearGradient(0, 0, 0, topHeight);
    topGradient.addColorStop(0, withAlpha(color, 1));
    topGradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, topHeight);
  }

  if (fade.bottom) {
    const bottomHeight = height * fade.bottom;
    const bottomGradient = ctx.createLinearGradient(
      0,
      height,
      0,
      height - bottomHeight,
    );
    bottomGradient.addColorStop(0, withAlpha(color, 1));
    bottomGradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, height - bottomHeight, width, bottomHeight);
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

export function drawTemplateFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  template: PosterStyleTemplate,
): void {
  const { frame } = template;
  if (frame.type === "none") return;

  const inset = Math.min(width, height) * frame.inset;
  const lineWidth =
    frame.type === "mat" ? Math.max(2, inset * 0.18) : Math.max(1, inset * 0.08);

  ctx.save();
  ctx.strokeStyle = withAlpha(color, frame.alpha);
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(
    inset + lineWidth / 2,
    inset + lineWidth / 2,
    width - inset * 2 - lineWidth,
    height - inset * 2 - lineWidth,
  );

  if (frame.type === "mat") {
    const innerInset = inset + lineWidth * 2.4;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = Math.max(1, lineWidth * 0.35);
    ctx.strokeRect(
      innerInset,
      innerInset,
      width - innerInset * 2,
      height - innerInset * 2,
    );
  }

  ctx.restore();
}
