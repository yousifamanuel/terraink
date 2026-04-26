const DATE_KEY = "terraink.adblock.date";
const COUNT_KEY = "terraink.adblock.count";
const DAILY_LIMIT = 1;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function canDownloadWithAdBlock(): boolean {
  try {
    const stored = localStorage.getItem(DATE_KEY);
    if (stored !== todayKey()) return true;
    return Number(localStorage.getItem(COUNT_KEY) ?? "0") < DAILY_LIMIT;
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

export function recordAdBlockDownload(): void {
  try {
    const today = todayKey();
    const stored = localStorage.getItem(DATE_KEY);
    const count = stored === today ? Number(localStorage.getItem(COUNT_KEY) ?? "0") : 0;
    localStorage.setItem(DATE_KEY, today);
    localStorage.setItem(COUNT_KEY, String(count + 1));
  } catch {
    // ignore storage errors
  }
}
