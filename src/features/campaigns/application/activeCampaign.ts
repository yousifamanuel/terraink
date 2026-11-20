import type { FontOption } from "@/core/config";
import {
  ensureFont,
  getTheme,
  loadBundledCampaigns,
  registerThemes,
} from "@/core/services";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import { setStartAppTheme } from "@/features/appTheme/application/useAppTheme";
import {
  isCampaignLive,
  parseCampaignManifest,
  pickDefaultTheme,
} from "../domain/types";

export interface Campaign {
  id: string;
  /** Shown as is (e.g. in the theme filter); not translated. */
  name: string;
  /** Its theme ids, in display order. */
  themeIds: string[];
  /** Its fonts; the first is applied with its themes. */
  fonts: string[];
  defaultThemeId: string;
  /** Poster text sizes in percent, applied with its themes. */
  titleSize?: number;
  subtitleSize?: number;
  /** Colors of the main theme, for the announcement. */
  colors: { bg: string; text: string; accent: string };
}

/**
 * The first bundled campaign that is usable and live. Its themes join the
 * normal theme list right away, before the app renders.
 */
function pickCampaign(): Campaign | null {
  for (const bundled of loadBundledCampaigns()) {
    const manifest = parseCampaignManifest(bundled.manifest, bundled.id);
    if (!manifest || !isCampaignLive(manifest, new Date())) continue;

    const registered = new Set(registerThemes(bundled.themes).map((option) => option.id));
    const themeIds = manifest.themes.filter((id) => registered.has(id));
    const defaultThemeId = pickDefaultTheme(manifest, themeIds);
    if (!defaultThemeId) continue;

    const mainTheme = getTheme(defaultThemeId);
    if (manifest.fonts[0]) void ensureFont(manifest.fonts[0]).catch(() => undefined);
    return {
      id: manifest.id,
      name: manifest.name,
      themeIds,
      fonts: manifest.fonts,
      defaultThemeId,
      titleSize: manifest.titleSize,
      subtitleSize: manifest.subtitleSize,
      colors: {
        bg: mainTheme.ui.bg,
        text: mainTheme.ui.text,
        accent: mainTheme.map.roads.major,
      },
    };
  }
  return null;
}

const campaign = pickCampaign();
// The app starts in the main theme's look (if it offers one).
if (campaign) setStartAppTheme(campaign.defaultThemeId);

/** The running campaign, or null when none is bundled. */
export function getCampaign(): Campaign | null {
  return campaign;
}

/**
 * The font list with the campaign's fonts first, right after the default
 * option (each font listed once).
 */
export function withCampaignFonts(options: FontOption[]): FontOption[] {
  const families = campaign?.fonts ?? [];
  if (families.length === 0) return options;
  const head = options[0]?.value === "" ? [options[0]] : [];
  const rest = options.slice(head.length);
  const campaignOptions = families.map(
    (family) => rest.find((option) => option.value === family) ?? { value: family, label: family },
  );
  const others = rest.filter((option) => !families.includes(option.value));
  return [...head, ...campaignOptions, ...others];
}

/** The campaign as an extra theme filter group, selected first. */
export function campaignThemeGroup() {
  if (!campaign) return null;
  return {
    id: `campaign:${campaign.id}`,
    label: campaign.name,
    color: campaign.colors.accent,
    themeIds: campaign.themeIds,
  };
}

export function isCampaignTheme(themeId: string): boolean {
  return Boolean(campaign?.themeIds.includes(themeId));
}

/** Poster text settings the campaign's themes bring along. */
export type CampaignText = Pick<PosterForm, "fontFamily" | "titleSize" | "subtitleSize">;

/** What its themes set; unset fields are left alone. */
export function campaignText(): Partial<CampaignText> {
  if (!campaign) return {};
  return {
    ...(campaign.fonts[0] ? { fontFamily: campaign.fonts[0] } : {}),
    ...(campaign.titleSize ? { titleSize: String(campaign.titleSize) } : {}),
    ...(campaign.subtitleSize ? { subtitleSize: String(campaign.subtitleSize) } : {}),
  };
}

// Text settings from before the campaign's themes were entered, and what
// they set; null while a normal theme is in use.
let entered: { before: CampaignText; applied: Partial<CampaignText> } | null = null;

/** Records entering the campaign's themes; returns the fields to set. */
export function enterCampaignText(form: CampaignText): Partial<CampaignText> {
  const applied = campaignText();
  entered = {
    before: {
      fontFamily: form.fontFamily,
      titleSize: form.titleSize,
      subtitleSize: form.subtitleSize,
    },
    applied,
  };
  return applied;
}

/**
 * Leaving the campaign's themes: returns the fields to put back. A field the
 * visitor changed in the meantime keeps their value.
 */
export function leaveCampaignText(form: CampaignText): Partial<CampaignText> {
  if (!entered) return {};
  const { before, applied } = entered;
  entered = null;
  const restore: Partial<CampaignText> = {};
  for (const key of Object.keys(applied) as (keyof CampaignText)[]) {
    if (form[key] === applied[key]) restore[key] = before[key];
  }
  return restore;
}

/**
 * The start form: visitors without a saved default theme open on the
 * campaign's main theme with its font and sizes (a saved default font stays).
 */
export function applyCampaignStart(
  form: PosterForm,
  hasSavedTheme: boolean,
  hasSavedFont: boolean,
): PosterForm {
  if (!campaign || hasSavedTheme) return form;
  const text = enterCampaignText(form);
  if (hasSavedFont && entered) {
    delete text.fontFamily;
    delete entered.applied.fontFamily;
  }
  return { ...form, theme: campaign.defaultThemeId, ...text };
}
