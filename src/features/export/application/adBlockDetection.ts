let _cached: boolean | null = null;

export function getCachedAdBlockState(): boolean | null {
  return _cached;
}

export function detectAdBlocker(): Promise<boolean> {
  if (_cached !== null) return Promise.resolve(_cached);

  return new Promise((resolve) => {
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
      _cached = blocked;
      resolve(blocked);
    });
  });
}
