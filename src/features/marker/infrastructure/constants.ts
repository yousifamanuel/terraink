/* ────── Marker rendering constants ────── */

/** Default marker size in pixels. */
export const DEFAULT_MARKER_SIZE = 40;

/** Minimum marker size the UI slider allows. */
export const MIN_MARKER_SIZE = 20;

/** Maximum marker size the UI slider allows. */
export const MAX_MARKER_SIZE = 80;

/** Step increment for the marker size slider. */
export const MARKER_SIZE_STEP = 2;

/** Fallback marker color when none is specified. */
export const DEFAULT_MARKER_COLOR = "#ffffff";

/* ── SVG geometry ── */

/** Standard viewBox dimensions used by all non-pin shapes. */
export const MARKER_VIEWBOX = 40;

/** Pin viewBox width. */
export const PIN_VIEWBOX_WIDTH = 30;

/** Pin viewBox height. */
export const PIN_VIEWBOX_HEIGHT = 42;

/** Pin element width as a ratio of the requested size. */
export const PIN_WIDTH_RATIO = 0.75;

/** Pin element height as a ratio of the requested size. */
export const PIN_HEIGHT_RATIO = 1.05;

/* ── SVG styling ── */

export const MARKER_DROP_SHADOW = "drop-shadow(0 2px 4px rgba(0,0,0,0.5))";
export const PIN_DROP_SHADOW = "drop-shadow(0 3px 5px rgba(0,0,0,0.5))";

export const OUTER_STROKE_COLOR = "rgba(255,255,255,0.8)";
export const OUTER_STROKE_WIDTH = 3;

export const PIN_STROKE_COLOR = "rgba(0,0,0,0.3)";
export const PIN_STROKE_WIDTH = 1.5;

export const PIN_INNER_FILL = "rgba(0,0,0,0.25)";
export const CIRCLE_INNER_FILL = "rgba(255,255,255,0.9)";
export const DIAMOND_INNER_FILL = "rgba(255,255,255,0.3)";

export const STAR_OUTER_RADIUS = 18;
export const STAR_INNER_RADIUS = 8;
export const STAR_STROKE_WIDTH = 1.5;

export const TARGET_OUTER_STROKE_WIDTH = 3;
export const TARGET_INNER_STROKE_WIDTH = 2;
export const TARGET_CROSSHAIR_STROKE_WIDTH = 2;
export const TARGET_OUTER_RADIUS = 16;
export const TARGET_INNER_RADIUS = 8;
export const TARGET_DOT_RADIUS = 3;
