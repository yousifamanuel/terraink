import { withAlpha } from "@/shared/utils/color";

export function applyFades(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
): void {
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
