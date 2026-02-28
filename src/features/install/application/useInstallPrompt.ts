import { useEffect, useState } from "react";
import {
  BeforeInstallPromptEvent,
  INSTALL_DISMISS_KEY,
  WEEK_MS,
} from "../domain/types";

function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
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
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const dismissedTs = localStorage.getItem(INSTALL_DISMISS_KEY);
    if (dismissedTs && Date.now() - Number(dismissedTs) < WEEK_MS) {
      setDismissed(true);
      return;
    }

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setDeferredPrompt(null);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
    setDismissed(true);
    setShowIosHint(false);
    setDeferredPrompt(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  }

  return {
    deferredPrompt,
    showIosHint,
    dismissed,
    dismiss,
    handleInstall,
  } as const;
}
