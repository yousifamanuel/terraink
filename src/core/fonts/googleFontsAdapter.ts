import type { IFontLoader } from "./ports";
import { resolveFontSelection } from "./catalog";
import type { FontSelection } from "./types";

function buildGoogleFontsUrl(families: string[], weight: number): string {
  const params = families
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${weight}`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export const googleFontsAdapter: IFontLoader = {
  async ensureFont(selection: FontSelection): Promise<void> {
    const { family, variant } = resolveFontSelection(selection);
    const dataVariantId = `${family.id}:${variant.id}`;
    const linkId = `font-${family.id.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "default"}`;

    if (family.source) {
      const href =
        family.source.kind === "google"
          ? buildGoogleFontsUrl(family.source.families, variant.weight)
          : family.source.href;
      const existingLink = document.getElementById(linkId) as HTMLLinkElement | null;

      if (!existingLink) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = href;
        link.dataset.fontFamily = family.id;
        link.dataset.fontVariant = dataVariantId;
        document.head.appendChild(link);
      } else {
        existingLink.href = href;
        existingLink.dataset.fontFamily = family.id;
        existingLink.dataset.fontVariant = dataVariantId;
      }
    }

    if (document.fonts?.load) {
      const fontStyle = variant.style ?? "normal";
      await Promise.allSettled([
        document.fonts.load(
          `${fontStyle} ${variant.weight} 16px "${family.titleFamily}"`,
        ),
        document.fonts.load(
          `${fontStyle} ${variant.weight} 16px "${family.bodyFamily}"`,
        ),
      ]);
    }
  },
};
