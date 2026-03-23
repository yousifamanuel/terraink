import type {
  FontFamilyDefinition,
  FontSelection,
  FontVariantDefinition,
  ResolvedFontSelection,
} from "./types";

const defaultVariants: FontVariantDefinition[] = [
  { id: "regular", label: "Regular", weight: 400 },
  { id: "bold", label: "Bold", weight: 700 },
];

const sansGoogleVariants: FontVariantDefinition[] = [
  { id: "regular", label: "Regular", weight: 400 },
  { id: "bold", label: "Bold", weight: 700 },
];

const sourceHanSansVariants: FontVariantDefinition[] = [
  { id: "extralight", label: "ExtraLight", weight: 250 },
  { id: "light", label: "Light", weight: 300 },
  { id: "normal", label: "Normal", weight: 350 },
  { id: "regular", label: "Regular", weight: 400 },
  { id: "medium", label: "Medium", weight: 500 },
  { id: "bold", label: "Bold", weight: 700 },
  { id: "heavy", label: "Heavy", weight: 900 },
];

const sourceHanSerifVariants: FontVariantDefinition[] = [
  { id: "extralight", label: "ExtraLight", weight: 250 },
  { id: "light", label: "Light", weight: 300 },
  { id: "regular", label: "Regular", weight: 400 },
  { id: "medium", label: "Medium", weight: 500 },
  { id: "semibold", label: "SemiBold", weight: 600 },
  { id: "bold", label: "Bold", weight: 700 },
  { id: "heavy", label: "Heavy", weight: 900 },
];

function createGoogleFamily(
  id: string,
  label: string,
  titleFallback: string,
  bodyFallback = titleFallback,
  loaderFamily = label,
): FontFamilyDefinition {
  return {
    id,
    label,
    titleFamily: label,
    bodyFamily: label,
    titleFallback,
    bodyFallback,
    defaultVariantId: "regular",
    variants: sansGoogleVariants,
    source: {
      kind: "google",
      families: [loaderFamily],
    },
  };
}

export const DEFAULT_FONT_FAMILY_ID = "";
export const DEFAULT_FONT_VARIANT_ID = "regular";

export const fontCatalog: FontFamilyDefinition[] = [
  {
    id: DEFAULT_FONT_FAMILY_ID,
    label: "Default (Space Grotesk / IBM Plex Mono)",
    titleFamily: "Space Grotesk",
    bodyFamily: "IBM Plex Mono",
    titleFallback: "sans-serif",
    bodyFallback: "monospace",
    defaultVariantId: DEFAULT_FONT_VARIANT_ID,
    variants: defaultVariants,
  },
  createGoogleFamily("Montserrat", "Montserrat", "sans-serif"),
  createGoogleFamily("Playfair Display", "Playfair Display", "serif"),
  createGoogleFamily("Oswald", "Oswald", "sans-serif"),
  createGoogleFamily("Noto Sans JP", "Noto Sans JP", "sans-serif"),
  createGoogleFamily("Source Sans Pro", "Source Sans Pro", "sans-serif"),
  createGoogleFamily("Raleway", "Raleway", "sans-serif"),
  createGoogleFamily("Lato", "Lato", "sans-serif"),
  createGoogleFamily("Merriweather", "Merriweather", "serif"),
  createGoogleFamily("Bebas neue", "Bebas Neue", "sans-serif", "sans-serif", "Bebas Neue"),
  {
    id: "Source Han Sans SC",
    label: "思源黑体",
    titleFamily: "Source Han Sans SC VF",
    bodyFamily: "Source Han Sans SC VF",
    titleFallback: "sans-serif",
    bodyFallback: "sans-serif",
    defaultVariantId: "regular",
    variants: sourceHanSansVariants,
    source: {
      kind: "external-css",
      href: "https://cdn.jsdelivr.net/npm/cn-fontsource-source-han-sans-sc-vf@1.0.10/font.css",
    },
  },
  {
    id: "Source Han Serif SC",
    label: "思源宋体",
    titleFamily: "Source Han Serif SC VF",
    bodyFamily: "Source Han Serif SC VF",
    titleFallback: "serif",
    bodyFallback: "serif",
    defaultVariantId: "regular",
    variants: sourceHanSerifVariants,
    source: {
      kind: "external-css",
      href: "https://cdn.jsdelivr.net/npm/cn-fontsource-source-han-serif-sc-vf-regular@1.0.1/font.css",
    },
  },
];

export function getFontFamily(fontFamily?: string | null): FontFamilyDefinition | null {
  const familyId = String(fontFamily ?? "");
  return fontCatalog.find((family) => family.id === familyId) ?? null;
}

export function getFontVariantOptions(
  fontFamily?: string | null,
): FontVariantDefinition[] {
  return resolveFontSelection({ fontFamily }).family.variants;
}

export function resolveFontSelection(
  selection: FontSelection,
): ResolvedFontSelection {
  const family =
    getFontFamily(selection.fontFamily) ??
    fontCatalog.find((entry) => entry.id === DEFAULT_FONT_FAMILY_ID) ??
    fontCatalog[0];
  const variant =
    family.variants.find(
      (entry) => entry.id === String(selection.fontVariant ?? ""),
    ) ??
    family.variants.find((entry) => entry.id === family.defaultVariantId) ??
    family.variants[0];

  return { family, variant };
}

export function buildFontStack(fontFamily: string, fallback: string): string {
  return `"${fontFamily}", ${fallback}`;
}
