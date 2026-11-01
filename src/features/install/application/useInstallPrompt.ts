import { useEffect, useState } from "react";
import { localStorageCache } from "@/core/cache/localStorageCache";
import { isNativePlatform } from "@/core/platform";
import { trackEvent } from "@/core/services";
import {
  BeforeInstallPromptEvent,
  INSTALL_DISMISS_KEY,
  WEEK_MS,
} from "../domain/types";

declare global {
  interface Window {
    __terrainkDeferredInstallPrompt?: Event;
  }
}

function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  return (
    ("standalone" in window.navigator
      ? (window.navigator as { standalone?: boolean }).standalone === true
      : false) || window.matchMedia("(display-mode: standalone)").matches
  );
}

export default function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [showAndroidHint, setShowAndroidHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [beforeInstallPromptFired, setBeforeInstallPromptFired] =
    useState(false);
  const [promptOutcome, setPromptOutcome] = useState<
    "accepted" | "dismissed" | "failed" | null
  >(null);
  const [swControlled, setSwControlled] = useState(false);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (isNativePlatform()) return;

    setBeforeInstallPromptFired(Boolean(window.__terrainkDeferredInstallPrompt));
    setSwControlled(Boolean(navigator.serviceWorker?.controller));
    if (navigator.serviceWorker?.ready) {
      void navigator.serviceWorker.ready
        .then(() => setSwReady(true))
        .catch(() => setSwReady(false));
    }

    if (isInStandaloneMode()) return;

    if (localStorageCache.read<boolean>(INSTALL_DISMISS_KEY, WEEK_MS)) {
      setDismissed(true);
      return;
    }

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    if (window.__terrainkDeferredInstallPrompt) {
      setDeferredPrompt(
        window.__terrainkDeferredInstallPrompt as BeforeInstallPromptEvent,
      );
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setBeforeInstallPromptFired(true);
      setShowAndroidHint(false);
      window.__terrainkDeferredInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);

    const fallbackTimer = window.setTimeout(() => {
      if (isAndroid() && !window.__terrainkDeferredInstallPrompt) {
        setShowAndroidHint(true);
      }
    }, 4000);

    const installedHandler = () => {
      setDeferredPrompt(null);
      setShowAndroidHint(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  function dismiss() {
    localStorageCache.write(INSTALL_DISMISS_KEY, true);
    setDismissed(true);
    setShowIosHint(false);
    setShowAndroidHint(false);
    setDeferredPrompt(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowAndroidHint(false);
        setPromptOutcome("accepted");
        trackEvent("install_accepted");
      } else {
        setShowAndroidHint(true);
        setPromptOutcome("dismissed");
      }
    } catch {
      setShowAndroidHint(true);
      setPromptOutcome("failed");
    }
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    isSecureContext,
    isIos: isIos(),
    isAndroid: isAndroid(),
    isStandaloneMode: isInStandaloneMode(),
    deferredPromptAvailable: Boolean(deferredPrompt),
    deferredPromptCached: Boolean(window.__terrainkDeferredInstallPrompt),
    beforeInstallPromptFired,
    promptOutcome,
    swControlled,
    swReady,
    dismissed,
  } as const;

  return {
    deferredPrompt,
    showIosHint,
    showAndroidHint,
    dismissed,
    dismiss,
    handleInstall,
    diagnostics,
  } as const;
}
