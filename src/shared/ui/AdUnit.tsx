import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/core/config";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export default function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !slot || !ADSENSE_CLIENT) return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // ignore — ad blocker or script not yet loaded
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
