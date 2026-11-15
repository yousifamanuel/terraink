import type { MobileTab } from "./MobileNavBar";

/** Window event that asks the app shell to show a side-panel tab. */
export const OPEN_PANEL_TAB_EVENT = "terraink:open-panel-tab";

export interface OpenPanelTabDetail {
  tab: MobileTab;
}

/** Shows the given tab in the side panel (desktop) and drawer (mobile). */
export function openPanelTab(tab: MobileTab): void {
  window.dispatchEvent(
    new CustomEvent<OpenPanelTabDetail>(OPEN_PANEL_TAB_EVENT, {
      detail: { tab },
    }),
  );
}
