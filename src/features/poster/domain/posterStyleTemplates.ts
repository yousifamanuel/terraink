export type PosterStyleTemplateId =
  | "classic"
  | "minimal"
  | "editorial"
  | "caption"
  | "masthead";

export type PosterTextAlign = "left" | "center" | "right";

export interface PosterFadeSpec {
  top?: number;
  bottom?: number;
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
  margin: number;
  side: "split" | "right" | "stacked-left";
}

export interface PosterStyleTemplate {
  id: PosterStyleTemplateId;
  name: string;
  description: string;
  fade: PosterFadeSpec;
  frame: PosterFrameSpec;
  text: PosterTextLayoutSpec;
  attribution: PosterAttributionSpec;
}

/**
 * Poster style templates — print-grade typographic lockups designed to read as
 * framed wall art rather than web cards.
 *
 * Design rules baked into these numbers:
 *  - The big title and any rule/sub-lines never overlap. City text occupies
 *    roughly `cityScale * 4.6%` of the poster height (centred on `cityY`), so
 *    every divider/country/coords row is spaced clear of the title's descenders.
 *  - Fades exist only to *seat* the type, never to mute the map: they reach just
 *    far enough to carry the lockup and dissolve well before the focal area.
 *  - Each template has one job. Horizon is the grand centred classic, Compass is
 *    a poised right-aligned eyebrow lockup, Editorial is the bold left masthead,
 *    Gallery is the matted fine-art print, and Masthead bands the title
 *    cinematically up top.
 */
export const POSTER_STYLE_TEMPLATES: PosterStyleTemplate[] = [
  {
    id: "classic",
    name: "Horizon",
    description: "The grand centered title, floating on a soft horizon of map.",
    fade: { bottom: 0.4 },
    frame: { type: "none", inset: 0, alpha: 0 },
    text: {
      align: "center",
      x: 0.5,
      width: 0.86,
      cityY: 0.838,
      dividerY: 0.882,
      countryY: 0.907,
      coordsY: 0.941,
      dividerStart: 0.44,
      dividerEnd: 0.56,
      cityScale: 0.94,
      countryScale: 0.88,
      coordsScale: 0.85,
      letterSpacedCity: true,
      showDivider: true,
    },
    attribution: { margin: 0.032, side: "split" },
  },
  {
    id: "minimal",
    name: "Compass",
    description: "A poised right-aligned lockup, region set as an eyebrow above the city.",
    fade: { bottom: 0.4 },
    frame: { type: "none", inset: 0, alpha: 0 },
    text: {
      align: "right",
      x: 0.915,
      width: 0.8,
      countryY: 0.808,
      dividerY: 0.84,
      cityY: 0.878,
      coordsY: 0.916,
      dividerStart: 0.715,
      dividerEnd: 0.915,
      cityScale: 0.82,
      countryScale: 0.78,
      coordsScale: 0.8,
      letterSpacedCity: false,
      showDivider: true,
    },
    attribution: { margin: 0.032, side: "split" },
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "A bold, left-aligned lockup with a magazine cover's confidence.",
    fade: { bottom: 0.44 },
    frame: { type: "none", inset: 0, alpha: 0 },
    text: {
      align: "left",
      x: 0.085,
      width: 0.82,
      cityY: 0.828,
      dividerY: 0.876,
      countryY: 0.903,
      coordsY: 0.939,
      dividerStart: 0.085,
      dividerEnd: 0.26,
      cityScale: 1,
      countryScale: 0.85,
      coordsScale: 0.85,
      letterSpacedCity: false,
      showDivider: true,
    },
    attribution: { margin: 0.036, side: "split" },
  },
  {
    id: "caption",
    name: "Gallery",
    description: "A matted fine-art print with a delicate top-left caption.",
    fade: { top: 0.3, bottom: 0.12 },
    frame: { type: "mat", inset: 0.055, alpha: 0.5 },
    text: {
      align: "left",
      x: 0.1,
      width: 0.74,
      cityY: 0.115,
      dividerY: 0.158,
      countryY: 0.184,
      coordsY: 0.215,
      dividerStart: 0.1,
      dividerEnd: 0.28,
      cityScale: 0.6,
      countryScale: 0.85,
      coordsScale: 0.8,
      letterSpacedCity: true,
      showDivider: true,
    },
    attribution: { margin: 0.072, side: "split" },
  },
  {
    id: "masthead",
    name: "Masthead",
    description: "A cinematic title banded across the crown of the map.",
    fade: { top: 0.38, bottom: 0.14 },
    frame: { type: "none", inset: 0, alpha: 0 },
    text: {
      align: "center",
      x: 0.5,
      width: 0.84,
      cityY: 0.135,
      dividerY: 0.182,
      countryY: 0.207,
      coordsY: 0.239,
      dividerStart: 0.44,
      dividerEnd: 0.56,
      cityScale: 0.82,
      countryScale: 0.82,
      coordsScale: 0.82,
      letterSpacedCity: true,
      showDivider: true,
    },
    attribution: { margin: 0.032, side: "split" },
  },
];

export const DEFAULT_POSTER_STYLE_TEMPLATE_ID: PosterStyleTemplateId = "classic";

export function getPosterStyleTemplate(
  templateId: string | undefined | null,
): PosterStyleTemplate {
  return (
    POSTER_STYLE_TEMPLATES.find((template) => template.id === templateId) ??
    POSTER_STYLE_TEMPLATES[0]
  );
}
