let _cached: boolean | null = null;
let _fastPromise: Promise<boolean> | null = null;

export function getCachedAdBlockState(): boolean | null {
  return _cached;
}

function runBaitCheck(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const bait = document.createElement("div");
    bait.className = "adsbox pub_300x250 pub_728x90";
    bait.style.cssText =
      "width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;pointer-events:none;";
    document.body.appendChild(bait);

    requestAnimationFrame(() => {
      const style = window.getComputedStyle(bait);
      const blocked =
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        style.display === "none" ||
        style.visibility === "hidden";
      document.body.removeChild(bait);
      resolve(blocked);
    });
  });
}

// Page-load check — cached so it only runs once per session.
export function detectAdBlocker(): Promise<boolean> {
  if (_cached === true) return Promise.resolve(true);
  if (_fastPromise) return _fastPromise;

  _fastPromise = runBaitCheck().then((blocked) => {
    if (blocked) _cached = true;
    return blocked;
  });

  return _fastPromise;
}

// Pre-download check — always fresh so mid-session disable/enable is respected.
// Updates _cached so the page-load modal logic stays consistent.
export async function checkAdBlockerNow(): Promise<boolean> {
  const blocked = await runBaitCheck();
  _cached = blocked;
  return blocked;
}

// Slow check via AdSense script (up to 3 s). Network-level blockers
// (AdGuard, Pi-hole) block the script request rather than hiding DOM
// elements — if adsbygoogle never becomes an array, the script was blocked.
export function detectAdBlockerAsync(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (_cached === true) { resolve(true); return; }

    const start = Date.now();
    const poll = () => {
      if (Array.isArray((window as any).adsbygoogle)) {
        if (_cached === null) _cached = false;
        resolve(false);
        return;
      }
      if (Date.now() - start >= 3000) {
        _cached = true;
        resolve(true);
        return;
      }
      setTimeout(poll, 200);
    };
    poll();
  });
}
