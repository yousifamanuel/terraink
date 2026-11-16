import { loadVideoGuideState, saveVideoGuideState } from "@/core/services";

/** After this many closes without a click, the follow prompt takes over. */
const MAX_DISMISSALS = 3;

/**
 * The video guide is offered until the user opens it or closes it three
 * times; then the follow prompt shows instead. A separate flag (not the
 * download count), so existing users also see it once.
 */
export function shouldOfferVideoGuide(): boolean {
  const state = loadVideoGuideState();
  return !state.clicked && state.dismissals < MAX_DISMISSALS;
}

export function markVideoGuideClicked(): void {
  saveVideoGuideState({ ...loadVideoGuideState(), clicked: true });
}

export function markVideoGuideDismissed(): void {
  const state = loadVideoGuideState();
  saveVideoGuideState({ ...state, dismissals: state.dismissals + 1 });
}
