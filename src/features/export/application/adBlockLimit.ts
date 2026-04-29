const STORAGE_KEY = "t.ui.s";
const DAILY_LIMIT = 1;

interface AdBlockState {
  d: string;  // date YYYY-MM-DD
  n: number;  // downloads today with ad blocker
  p: number;  // poster count snapshot (cross-reference with total download history)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readState(): AdBlockState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.d && typeof parsed.n === "number") return parsed as AdBlockState;
    return null;
  } catch {
    return null;
  }
}

export function canDownloadWithAdBlock(): boolean {
  try {
    const state = readState();
    if (!state || state.d !== todayKey()) return true;
    return state.n < DAILY_LIMIT;
  } catch {
    return true;
  }
}

export function hoursUntilAdBlockReset(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000));
}

export function recordAdBlockDownload(posterCount: number): void {
  try {
    const today = todayKey();
    const existing = readState();
    const n = (existing?.d === today ? existing.n : 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ d: today, n, p: posterCount }));
  } catch {
    // ignore storage errors
  }
}
