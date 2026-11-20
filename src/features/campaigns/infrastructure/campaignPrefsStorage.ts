const keyFor = (id: string) => `terraink:campaign-seen:${id}`;

/** Whether this visitor already saw the campaign's announcement. */
export function isCampaignSeen(id: string): boolean {
  try {
    return window.localStorage.getItem(keyFor(id)) === "1";
  } catch {
    return false;
  }
}

export function markCampaignSeen(id: string): void {
  try {
    window.localStorage.setItem(keyFor(id), "1");
  } catch {
    // Storage blocked (private mode): it shows again next visit.
  }
}
