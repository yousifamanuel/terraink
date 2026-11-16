import type { PosterForm } from "./posterReducer";

/** The Color tab settings at "no change". */
export const COLOR_ADJUST_DEFAULTS: Partial<PosterForm> = {
  colorBrightness: "0",
  colorContrast: "0",
  colorSaturation: "0",
  colorHue: "0",
  colorWarmth: "0",
  colorInvert: false,
  colorGrayscale: false,
};
