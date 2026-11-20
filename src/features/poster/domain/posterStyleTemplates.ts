export type PosterTextAlign = "left" | "center" | "right";

export interface PosterFadeSpec {
  top?: number;
  bottom?: number;
  /** Top/bottom fades start this far in from the edge (share of height), e.g. at a border. */
  offsetY?: number;
  left?: number;
  right?: number;
}

export type BorderLine = "single" | "double";
export type DividerStyle = "solid" | "dashed" | "dotted";
export type BorderDash = "solid" | "dashed";

export interface PosterFrameSpec {
  type: "none" | "hairline" | "mat";
  inset: number;
  alpha: number;
  /** One line or two parallel lines. */
  line?: BorderLine;
  dash?: BorderDash;
  /** Line width as a share of the shorter side. */
  thickness?: number;
}

/** Gap between the two lines of a double border, in line widths. */
export const DOUBLE_LINE_GAP = 2;

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
  dividerStyle?: DividerStyle;
  /** Divider thickness relative to the default line (1 = default). */
  dividerScale?: number;
  /** Outer glow around the title in its own color; 0 or unset = none, 1 = default. */
  glow?: number;
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
  borderLine: BorderLine;
  borderDash: BorderDash;
  /** Line thickness in % of the shorter side. */
  borderThickness: number;
  /** Title and subtitle size in % of the default. */
  titleSize: number;
  subtitleSize: number;
  /** Moves the whole text block, in % of the poster height (+ = down). */
  textOffset: number;
  /** Short line between title and subtitle. */
  showDivider: boolean;
  dividerStyle: DividerStyle;
  /** Divider thickness in % of the default line. */
  dividerThickness: number;
  /** Outer glow around the text in its own color. */
  textGlow: boolean;
  /** Glow strength in % of the default. */
  textGlowStrength: number;
}

export const DEFAULT_POSTER_LAYOUT: PosterLayoutOptions = {
  textPosition: "bottom",
  textAlign: "center",
  border: false,
  borderWidth: 4,
  borderLine: "single",
  borderDash: "solid",
  borderThickness: 0.25,
  titleSize: 100,
  subtitleSize: 100,
  textOffset: 0,
  showDivider: true,
  dividerStyle: "solid",
  dividerThickness: 100,
  textGlow: false,
  textGlowStrength: 200,
};

export const DIVIDER_STYLES: DividerStyle[] = ["solid", "dashed", "dotted"];
export const DIVIDER_THICKNESS_MIN = 50;
export const DIVIDER_THICKNESS_MAX = 300;
export const TEXT_GLOW_MIN = 25;
export const TEXT_GLOW_MAX = 300;
/** Road glow strength range, in % of the default. */
export const ROAD_GLOW_MIN = 25;
export const ROAD_GLOW_MAX = 300;
export const ROAD_GLOW_DEFAULT = 200;

export const TEXT_SIZE_MIN = 50;
export const TEXT_SIZE_MAX = 150;
/**
 * How far (% of the poster) the text block may move away from its edge,
 * toward the middle. It never moves outward: a bottom block would cover the
 * credits, a top block would leave the poster.
 */
export const TEXT_OFFSET_MAX = 10;

export const BORDER_LINES: BorderLine[] = ["single", "double"];
export const BORDER_DASHES: BorderDash[] = ["solid", "dashed"];
export const BORDER_THICKNESS_MIN = 0.1;
export const BORDER_THICKNESS_MAX = 1.5;

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

function clampRange(value: number, min: number, max: number, fallback: number): number {
  const n = Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Text rows for the chosen sizes. Gaps between rows grow with the text they
 * belong to; the block stays anchored at the poster edge it sits on (bottom
 * block grows upward, top block downward), then moves by the offset.
 */
function stackRows(
  position: PosterTextPosition,
  titleRatio: number,
  subtitleRatio: number,
  offset: number,
): Required<Pick<PosterTextLayoutSpec, "cityY" | "dividerY" | "countryY" | "coordsY">> {
  const base = ROWS[position];
  const dividerY = base.dividerY ?? base.cityY;
  const titleGap = (dividerY - base.cityY) * titleRatio;
  const dividerGap = (base.countryY - dividerY) * subtitleRatio;
  const subtitleGap = (base.coordsY - base.countryY) * subtitleRatio;
  if (position === "bottom") {
    const coordsY = base.coordsY;
    const countryY = coordsY - subtitleGap;
    const divider = countryY - dividerGap;
    return {
      cityY: divider - titleGap + offset,
      dividerY: divider + offset,
      countryY: countryY + offset,
      coordsY: coordsY + offset,
    };
  }
  const cityTop = base.cityY - (dividerY - base.cityY);
  const cityY = cityTop + titleGap;
  const divider = cityY + titleGap;
  const countryY = divider + dividerGap;
  return {
    cityY: cityY + offset,
    dividerY: divider + offset,
    countryY: countryY + offset,
    coordsY: countryY + subtitleGap + offset,
  };
}

/**
 * How far the line(s) reach inward from the frame edge. A double border's
 * extra line sits outside (in the band), so only the main line counts.
 */
function linesExtent(_line: BorderLine, thickness: number): number {
  return thickness;
}

function clampThickness(percent: number): number {
  const value = Number.isFinite(percent) ? percent : DEFAULT_POSTER_LAYOUT.borderThickness;
  return Math.min(BORDER_THICKNESS_MAX, Math.max(BORDER_THICKNESS_MIN, value));
}

/** Builds the full text layout from the user's position and alignment. */
export function buildPosterLayout(
  options: Partial<PosterLayoutOptions> = {},
  /** Poster width ÷ height, to turn shorter-side sizes into width/height shares. */
  aspect: number = DEFAULT_ASPECT,
): PosterStyleTemplate {
  const {
    textPosition,
    textAlign,
    border,
    borderWidth,
    borderLine,
    borderDash,
    borderThickness,
    titleSize,
    subtitleSize,
    textOffset,
    showDivider,
    dividerStyle,
    dividerThickness,
    textGlow,
    textGlowStrength,
  } = {
    ...DEFAULT_POSTER_LAYOUT,
    ...options,
  };
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : DEFAULT_ASPECT;
  // Shorter side as a share of the width and of the height.
  const shortOfWidth = Math.min(1, 1 / safeAspect);
  const shortOfHeight = Math.min(1, safeAspect);
  const inset = border ? borderInset(borderWidth) : 0;
  const thickness = clampThickness(borderThickness) / 100;
  // Inner edge of the line(s): credits and text keep their distance from it.
  const frameInner = border ? inset + linesExtent(borderLine, thickness) : 0;
  const creditInset = frameInner + BORDER_CREDIT_GAP;
  const marginX = border ? creditInset * shortOfWidth : ATTRIBUTION_MARGIN;
  const marginY = border ? creditInset * shortOfHeight : ATTRIBUTION_MARGIN;

  // With a border the text block is laid out inside the frame: rows are
  // squeezed into the inner area and the text shrinks with it, so a wider
  // border means proportionally smaller text (default width = normal size).
  const insetY = frameInner * shortOfHeight;
  const defaultInsetY =
    (borderInset(DEFAULT_POSTER_LAYOUT.borderWidth) +
      linesExtent(
        DEFAULT_POSTER_LAYOUT.borderLine,
        DEFAULT_POSTER_LAYOUT.borderThickness / 100,
      )) *
    shortOfHeight;
  const inner = (y: number) => insetY + y * (1 - 2 * insetY);
  const textScale = border ? (1 - 2 * insetY) / (1 - 2 * defaultInsetY) : 1;
  const titleRatio = clampRange(titleSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX, 100) / 100;
  const subtitleRatio = clampRange(subtitleSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX, 100) / 100;
  // Only toward the middle: up for a bottom block, down for a top block.
  const inward = clampRange(textOffset, 0, TEXT_OFFSET_MAX, 0) / 100;
  const offset = textPosition === "bottom" ? -inward : inward;
  const rows = stackRows(textPosition, titleRatio, subtitleRatio, offset);
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
      ? {
          type: "mat",
          inset,
          alpha: 0.85,
          line: borderLine,
          dash: borderDash,
          thickness,
        }
      : { type: "none", inset: 0, alpha: 0 },
    text: {
      align: textAlign,
      ...columns(textAlign, marginX),
      cityY: inner(rows.cityY),
      dividerY: inner(rows.dividerY),
      countryY: inner(rows.countryY),
      coordsY: inner(rows.coordsY),
      cityScale: 0.94 * textScale * titleRatio,
      countryScale: 0.88 * textScale * subtitleRatio,
      coordsScale: 0.85 * textScale,
      letterSpacedCity: true,
      showDivider,
      dividerStyle,
      dividerScale:
        clampRange(dividerThickness, DIVIDER_THICKNESS_MIN, DIVIDER_THICKNESS_MAX, 100) / 100,
      glow: textGlow ? clampRange(textGlowStrength, TEXT_GLOW_MIN, TEXT_GLOW_MAX, DEFAULT_POSTER_LAYOUT.textGlowStrength) / 100 : 0,
    },
    attribution: { margin: marginX, marginY, side: "split" },
  };
}
