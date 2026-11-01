import type { IFontLoader } from "./ports";

/**
 * Self-hosted font loader.
 *
 * Poster fonts ship with the bundle via @fontsource instead of being fetched
 * from Google's CDN at runtime, so selecting a font no longer transmits the
 * visitor's IP address to a third party.
 *
 * Each entry is a literal dynamic import so Vite can statically analyse it and
 * emit one chunk per family — a visitor only downloads the font they pick.
 * Keys are lowercased family names; look-ups normalise before matching because
 * FONT_OPTIONS spells some values inconsistently (e.g. "Bebas neue").
 *
 * Weights mirror the 300/400/700 set the previous CDN loader requested, minus
 * the weights a family does not publish (Playfair Display has no 300, Bebas
 * Neue ships 400 only).
 */
const FONT_LOADERS: Record<string, () => Promise<unknown>> = {
  montserrat: () =>
    Promise.all([
      import("@fontsource/montserrat/300.css"),
      import("@fontsource/montserrat/400.css"),
      import("@fontsource/montserrat/700.css"),
    ]),
  "playfair display": () =>
    Promise.all([
      import("@fontsource/playfair-display/400.css"),
      import("@fontsource/playfair-display/700.css"),
    ]),
  oswald: () =>
    Promise.all([
      import("@fontsource/oswald/300.css"),
      import("@fontsource/oswald/400.css"),
      import("@fontsource/oswald/700.css"),
    ]),
  "noto sans jp": () =>
    Promise.all([
      import("@fontsource/noto-sans-jp/300.css"),
      import("@fontsource/noto-sans-jp/400.css"),
      import("@fontsource/noto-sans-jp/700.css"),
    ]),
  "source sans pro": () =>
    Promise.all([
      import("@fontsource/source-sans-pro/300.css"),
      import("@fontsource/source-sans-pro/400.css"),
      import("@fontsource/source-sans-pro/700.css"),
    ]),
  raleway: () =>
    Promise.all([
      import("@fontsource/raleway/300.css"),
      import("@fontsource/raleway/400.css"),
      import("@fontsource/raleway/700.css"),
    ]),
  lato: () =>
    Promise.all([
      import("@fontsource/lato/300.css"),
      import("@fontsource/lato/400.css"),
      import("@fontsource/lato/700.css"),
    ]),
  merriweather: () =>
    Promise.all([
      import("@fontsource/merriweather/300.css"),
      import("@fontsource/merriweather/400.css"),
      import("@fontsource/merriweather/700.css"),
    ]),
  "bebas neue": () => import("@fontsource/bebas-neue/400.css"),
};

export const localFontsAdapter: IFontLoader = {
  async ensureFont(fontFamily: string): Promise<void> {
    const family = String(fontFamily ?? "").trim();
    if (!family) {
      return;
    }

    const load = FONT_LOADERS[family.toLowerCase()];
    if (!load) {
      // Unknown family: the CSS fallback stack stays in place.
      return;
    }

    await load();

    // Wait for the faces to be usable before callers rasterise to canvas.
    if (document.fonts?.load) {
      await Promise.allSettled([
        document.fonts.load(`300 16px "${family}"`),
        document.fonts.load(`400 16px "${family}"`),
        document.fonts.load(`700 16px "${family}"`),
      ]);
    }
  },
};
