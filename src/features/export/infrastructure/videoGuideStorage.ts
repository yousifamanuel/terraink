/**
 * Whether the user opened or closed the video guide. A fixed key (no app
 * version in it), so the choice survives app updates.
 */
const STORAGE_KEY = "terraink:video-guide";

export interface VideoGuideState {
  clicked: boolean;
  dismissals: number;
}

export function loadVideoGuideState(): VideoGuideState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<VideoGuideState>) : {};
    return {
      clicked: Boolean(stored.clicked),
      dismissals: Number(stored.dismissals) || 0,
    };
  } catch {
    return { clicked: false, dismissals: 0 };
  }
}

export function saveVideoGuideState(state: VideoGuideState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked (private mode): the guide may simply show again.
  }
}
