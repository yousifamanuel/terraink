import type { PosterLayoutOptions } from "@/features/poster/domain/posterStyleTemplates";
import type { PosterForm } from "./posterReducer";

/** The poster form's layout settings, shared by the preview and every export. */
export function getPosterLayoutOptions(form: PosterForm): PosterLayoutOptions {
  return {
    textPosition: form.textPosition,
    textAlign: form.textAlign,
    border: form.showBorder,
    borderWidth: Number(form.borderWidth),
    borderLine: form.borderLine,
    borderDash: form.borderDash,
    borderThickness: Number(form.borderThickness),
    titleSize: Number(form.titleSize),
    subtitleSize: Number(form.subtitleSize),
    textOffset: Number(form.textOffset),
  };
}
