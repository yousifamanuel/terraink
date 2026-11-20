import { useEffect, useRef, type Dispatch } from "react";
import { ensureFont } from "@/core/services";
import type { PosterAction, PosterForm } from "@/features/poster/application/posterReducer";
import {
  enterCampaignText,
  getCampaign,
  isCampaignTheme,
  leaveCampaignText,
  type CampaignText,
} from "./activeCampaign";

// Only the newest font request applies, so quick switches can't end on an
// older font that finished loading late.
let latestFontRequest = 0;

/**
 * Sets the text fields; the font only once its files are loaded, as the
 * poster text is drawn on a canvas for exports and would keep the fallback.
 */
function applyText(fields: Partial<CampaignText>, dispatch: Dispatch<PosterAction>) {
  const { fontFamily, ...sizes } = fields;
  if (Object.keys(sizes).length > 0) dispatch({ type: "SET_FORM_FIELDS", fields: sizes });
  if (fontFamily === undefined) return;
  const request = ++latestFontRequest;
  const apply = () => {
    if (request !== latestFontRequest) return;
    dispatch({ type: "SET_FIELD", name: "fontFamily", value: fontFamily });
  };
  if (!fontFamily) apply();
  else void ensureFont(fontFamily).then(apply, apply);
}

/**
 * Moving from a normal theme to one of the campaign's themes applies its font
 * and text sizes; moving back puts the previous ones back.
 */
export function useCampaignThemeText(form: PosterForm, dispatch: Dispatch<PosterAction>): void {
  const previousTheme = useRef(form.theme);

  useEffect(() => {
    const was = previousTheme.current;
    previousTheme.current = form.theme;
    if (!getCampaign() || was === form.theme) return;
    const isIn = isCampaignTheme(form.theme);
    if (isIn && !isCampaignTheme(was)) applyText(enterCampaignText(form), dispatch);
    else if (!isIn && isCampaignTheme(was)) applyText(leaveCampaignText(form), dispatch);
    // Only theme changes matter; the other fields are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.theme, dispatch]);
}
