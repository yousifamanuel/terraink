export type PosterTextAlign = "left" | "center" | "right";

export interface PosterFadeSpec {
  top?: number;
  bottom?: number;
  /** Top/bottom fades start this far in from the edge (share of height), e.g. at a border. */
  offsetY?: number;
  left?: number;
  right?: number;
}

export interface PosterFrameSpec {
  type: "none" | "hairline" | "mat";
  inset: number;
  alpha: number;
}

export interface PosterTextPanelSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
}

export interface PosterTextLayoutSpec {
  align: PosterTextAlign;
  x: number;
  width: number;
  cityY: number;
  countryY: number;
  coordsY: number;
  dividerY?: number;
  dividerStart?: number;
  dividerEnd?: number;
  cityScale: number;
  countryScale: number;
  coordsScale: number;
  letterSpacedCity: boolean;
  showDivider: boolean;
  panel?: PosterTextPanelSpec;
}

export interface PosterAttributionSpec {
  /** Distance of the credits from the left/right edge (share of width). */
  margin: number;
  /** Distance from the bottom edge (share of height); defaults to margin. */
  marginY?: number;
  side: "split" | "right" | "stacked-left";
}

export interface PosterStyleTemplate {
  fade: PosterFadeSpec;
  frame: PosterFrameSpec;
  text: PosterTextLayoutSpec;
  attribution: PosterAttributionSpec;
}

/** Where the title block sits on the poster. */
export type PosterTextPosition = "top" | "bottom";

export const POSTER_TEXT_POSITIONS: PosterTextPosition[] = ["top", "bottom"];
export const POSTER_TEXT_ALIGNS: PosterTextAlign[] = ["left", "center", "right"];

export interface PosterLayoutOptions {
  textPosition: PosterTextPosition;
  textAlign: PosterTextAlign;
  /** Plain band around the map with a thin line, like a framed print. */
  border: boolean;
  /** Border width in % of the poster's shorter side. */
  borderWidth: number;
}

export const DEFAULT_POSTER_LAYOUT: PosterLayoutOptions = {
  textPosition: "bottom",
  textAlign: "center",
  border: false,
  borderWidth: 4,
};

/** Border width range, in % of the poster's shorter side (same on all sides). */
export const BORDER_WIDTH_MIN = 1;
export const BORDER_WIDTH_MAX = 20;

/** Credits sit this far from the poster edge (share of width and of height). */
const ATTRIBUTION_MARGIN = 0.032;

/** With a border, credits sit just inside the line (share of the shorter side). */
const BORDER_CREDIT_GAP = 0.022;

/** Typical poster (A-series portrait) when the real aspect isn't known. */
const DEFAULT_ASPECT = 1 / Math.SQRT2;

/*
 * Rows of the title block (city, divider, country, coordinates) as a share of
 * the poster height. Spaced so the big title never touches the lines below.
 */
const ROWS: Record<PosterTextPosition, Pick<PosterTextLayoutSpec, "cityY" | "dividerY" | "countryY" | "coordsY">> = {
  bottom: { cityY: 0.838, dividerY: 0.882, countryY: 0.907, coordsY: 0.941 },
  // Mirror of "bottom": the top edge-to-title gap equals the coordinates-to-bottom gap.
  top: { cityY: 0.081, dividerY: 0.125, countryY: 0.15, coordsY: 0.184 },
};

/** Terraink's classic overlay: the same soft fade at the top and bottom. */
const FADE: PosterFadeSpec = { top: 0.25, bottom: 0.25 };

/** Length of the short divider line under a left/right-aligned title. */
const SIDE_DIVIDER_LENGTH = 0.175;

/**
 * Horizontal anchor, text box width and divider. Left/right text lines up
 * with the credits in the bottom corners (same side margin).
 */
function columns(
  align: PosterTextAlign,
  sideMargin: number,
): Pick<PosterTextLayoutSpec, "x" | "width" | "dividerStart" | "dividerEnd"> {
  if (align === "left") {
    return {
      x: sideMargin,
      width: 0.82,
      dividerStart: sideMargin,
      dividerEnd: sideMargin + SIDE_DIVIDER_LENGTH,
    };
  }
  if (align === "right") {
    return {
      x: 1 - sideMargin,
      width: 0.82,
      dividerStart: 1 - sideMargin - SIDE_DIVIDER_LENGTH,
      dividerEnd: 1 - sideMargin,
    };
  }
  return { x: 0.5, width: 0.86, dividerStart: 0.44, dividerEnd: 0.56 };
}

/** Border width (%) → share of the shorter side, kept inside the allowed range. */
function borderInset(widthPercent: number): number {
  const value = Number.isFinite(widthPercent) ? widthPercent : DEFAULT_POSTER_LAYOUT.borderWidth;
  return Math.min(BORDER_WIDTH_MAX, Math.max(BORDER_WIDTH_MIN, value)) / 100;
}

/** Builds the full text layout from the user's position and alignment. */
export function buildPosterLayout(
  options: Partial<PosterLayoutOptions> = {},
  /** Poster width ÷ height, to turn shorter-side sizes into width/height shares. */
  aspect: number = DEFAULT_ASPECT,
): PosterStyleTemplate {
  const { textPosition, textAlign, border, borderWidth } = {
    ...DEFAULT_POSTER_LAYOUT,
    ...options,
  };
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : DEFAULT_ASPECT;
  // Shorter side as a share of the width and of the height.
  const shortOfWidth = Math.min(1, 1 / safeAspect);
  const shortOfHeight = Math.min(1, safeAspect);
  const inset = border ? borderInset(borderWidth) : 0;
  const creditInset = inset + BORDER_CREDIT_GAP;
  const marginX = border ? creditInset * shortOfWidth : ATTRIBUTION_MARGIN;
  const marginY = border ? creditInset * shortOfHeight : ATTRIBUTION_MARGIN;

  // With a border the text block is laid out inside the frame: rows are
  // squeezed into the inner area and the text shrinks with it, so a wider
  // border means proportionally smaller text (default width = normal size).
  const insetY = inset * shortOfHeight;
  const defaultInsetY = borderInset(DEFAULT_POSTER_LAYOUT.borderWidth) * shortOfHeight;
  const inner = (y: number) => insetY + y * (1 - 2 * insetY);
  const textScale = border ? (1 - 2 * insetY) / (1 - 2 * defaultInsetY) : 1;
  const rows = ROWS[textPosition];
  // The overlay follows the border: it starts at the frame and its size is
  // a share of the area inside it, so it looks the same at any border width.
  const bandY = inset * shortOfHeight;
  const fade: PosterFadeSpec = border
    ? {
        top: (FADE.top ?? 0) * (1 - 2 * bandY),
        bottom: (FADE.bottom ?? 0) * (1 - 2 * bandY),
        offsetY: bandY,
      }
    : FADE;
  return {
    fade,
    frame: border
      ? { type: "mat", inset, alpha: 0.85 }
      : { type: "none", inset: 0, alpha: 0 },
    text: {
      align: textAlign,
      ...columns(textAlign, marginX),
      cityY: inner(rows.cityY),
      dividerY: inner(rows.dividerY ?? rows.cityY),
      countryY: inner(rows.countryY),
      coordsY: inner(rows.coordsY),
      cityScale: 0.94 * textScale,
      countryScale: 0.88 * textScale,
      coordsScale: 0.85 * textScale,
      letterSpacedCity: true,
      showDivider: true,
    },
    attribution: { margin: marginX, marginY, side: "split" },
  };
}
