let measureCanvas: HTMLCanvasElement | null = null;

/**
 * Width of `text` per 1px of font size in the given weight and CSS font
 * family list. 0 when it can't be measured (no canvas).
 */
export function measureTextWidthPerPx(
  text: string,
  weight: number,
  fontFamily: string,
): number {
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx || !text) return 0;
  ctx.font = `${weight} 100px ${fontFamily}`;
  return ctx.measureText(text).width / 100;
}
