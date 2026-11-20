import bundledCampaigns from "virtual:campaigns";

export interface BundledCampaign {
  id: string;
  /** campaign.json, still to be checked. */
  manifest: unknown;
  /** The campaign's themes, same format as the app's themes.json entries. */
  themes: Record<string, unknown>;
}

/** Campaigns bundled at build time, in VITE_CAMPAIGNS order. */
export function loadBundledCampaigns(): BundledCampaign[] {
  return bundledCampaigns;
}
