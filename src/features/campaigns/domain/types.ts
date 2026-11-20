/**
 * A campaign is a time-limited set of themes and fonts, bundled at build
 * time from a folder outside the app, one sub-folder per campaign:
 *   <base>/<id>/campaign.json  — this manifest
 *   <base>/<id>/themes.json    — the campaign's themes, same format as the app's
 */
export interface CampaignManifest {
  id: string;
  /** Shown as its theme filter and in its announcement; not translated. */
  name: string;
  /** Theme ids in display order. */
  themes: string[];
  /**
   * Font families in display order; each must be bundled with the app. The
   * first is applied with the campaign's themes.
   */
  fonts: string[];
  /** Theme new visitors start on; else the first theme. */
  defaultTheme?: string;
  /** Poster text sizes in percent (e.g. 150), applied with its themes. */
  titleSize?: number;
  subtitleSize?: number;
  /** ISO dates; outside this window the campaign hides itself. */
  startsAt?: string;
  endsAt?: string;
  /** Themes file next to campaign.json (default "themes.json"). */
  themesFile?: string;
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];
}

function asOptionalPercent(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function asOptionalString(value: unknown): string | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

/** Reads campaign.json; null when it is not usable. */
export function parseCampaignManifest(
  raw: unknown,
  id: string,
): CampaignManifest | null {
  if (typeof raw !== "object" || raw === null) return null;
  const data = raw as Record<string, unknown>;
  const themes = asStringList(data.themes);
  if (themes.length === 0) return null;

  return {
    id,
    name: asOptionalString(data.name) ?? id,
    themes,
    fonts: asStringList(data.fonts),
    defaultTheme: asOptionalString(data.defaultTheme),
    titleSize: asOptionalPercent(data.titleSize),
    subtitleSize: asOptionalPercent(data.subtitleSize),
    startsAt: asOptionalString(data.startsAt),
    endsAt: asOptionalString(data.endsAt),
    themesFile: asOptionalString(data.themesFile),
  };
}

/** True inside the optional start/end window; an unreadable date is ignored. */
export function isCampaignLive(manifest: CampaignManifest, now: Date): boolean {
  const time = now.getTime();
  const starts = manifest.startsAt ? Date.parse(manifest.startsAt) : NaN;
  const ends = manifest.endsAt ? Date.parse(manifest.endsAt) : NaN;
  if (!Number.isNaN(starts) && time < starts) return false;
  if (!Number.isNaN(ends) && time >= ends) return false;
  return true;
}

/** The theme to open with: the chosen default if available, else the first. */
export function pickDefaultTheme(
  manifest: CampaignManifest,
  availableIds: string[],
): string | null {
  if (manifest.defaultTheme && availableIds.includes(manifest.defaultTheme)) {
    return manifest.defaultTheme;
  }
  return availableIds[0] ?? null;
}
