import { useEffect, useRef, useState } from "react";
import { ADSENSE_AD_CLIENT } from "@/core/config";

interface AdUnitProps {
  slot: string;
  /** Whether this ad type is enabled (driven by its VITE_ADS_*_ENABLED flag). */
  enabled?: boolean;
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  /** Required for in-feed ("fluid") units — the data-ad-layout-key from AdSense. */
  layoutKey?: string;
  label?: string;
  className?: string;
}

export default function AdUnit({
  slot,
  enabled = true,
  format = "auto",
  layoutKey,
  label = "Ads keep Terraink free",
  className,
}: AdUnitProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  const isFluid = format === "fluid";

  // Watch the slot's width; only mount the <ins> once it has a real
  // (non-zero) width, so a positional adsbygoogle.push() can't burn it with
  // an "availableWidth=0" error. Google still decides the actual ad size.
  useEffect(() => {
    if (!enabled || !slot || !ADSENSE_AD_CLIENT) return;
    const el = slotRef.current;
    if (!el) return;

    const check = () => {
      if (el.offsetWidth > 0) setReady(true);
    };
    check();
    const resizeObserver = new ResizeObserver(check);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [enabled, slot]);

  // Push exactly once, only after the <ins> is mounted with a real width.
  useEffect(() => {
    if (!ready || pushed.current) return;
    const ins = insRef.current;
    if (!ins) return;
    pushed.current = true;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // ignore — ad blocker or script not yet loaded
    }

    // Hide the slot only when AdSense explicitly reports it unfilled.
    const statusObserver = new MutationObserver(() => {
      if (ins.getAttribute("data-ad-status") === "unfilled") setHidden(true);
    });
    statusObserver.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });
    return () => statusObserver.disconnect();
  }, [ready]);

  if (!enabled || !ADSENSE_AD_CLIENT || !slot || hidden) return null;
  // An in-feed unit can't render without its layout key.
  if (isFluid && !String(layoutKey ?? "").trim()) return null;

  // Fluid (in-feed) and display units need different attributes.
  const insProps = isFluid
    ? { "data-ad-layout-key": layoutKey }
    : { "data-full-width-responsive": "true" };

  // The measuring wrapper always renders (zero height when empty) so we can
  // read the available width before committing an <ins> to the DOM.
  return (
    <div ref={slotRef} className="ad-unit-measure">
      {ready && (
        <div className={`ad-unit-slot${className ? ` ${className}` : ""}`}>
          <p className="panel-ad-label">{label}</p>
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={ADSENSE_AD_CLIENT}
            data-ad-slot={slot}
            data-ad-format={format}
            {...insProps}
          />
        </div>
      )}
    </div>
  );
}
