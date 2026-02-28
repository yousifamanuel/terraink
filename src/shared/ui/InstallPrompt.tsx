import { useState, useEffect } from "react";
import { FaMobileAlt as MobileIcon } from "react-icons/fa";

/* ── Helpers ── */

function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPad on iOS 13+ reports itself as MacIntel with touch points
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

/* ── Types ── */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/* ── Component ── */

export default function InstallPrompt() {
  // Android: hold deferred install prompt
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  // iOS: show manual instructions
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed — don't show anything
    if (isInStandaloneMode()) return;

    // iOS: show hint if not already dismissed (persisted in sessionStorage)
    if (isIos()) {
      const alreadyDismissed = sessionStorage.getItem("install-dismissed");
      if (!alreadyDismissed) setShowIosHint(true);
      return;
    }

    // Android / Chrome: capture deferred prompt
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
    sessionStorage.setItem("install-dismissed", "1");
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

  if (dismissed) return null;

  // Android — native install prompt available
  if (deferredPrompt) {
    return (
      <div className="install-prompt" role="complementary">
        <span className="install-prompt-text">
          <MobileIcon
            className="install-prompt-mobile-icon"
            aria-hidden="true"
          />
          Add TerraInk to your home screen for quick access
        </span>
        <div className="install-prompt-actions">
          <button
            type="button"
            className="install-prompt-btn"
            onClick={handleInstall}
          >
            Add to Home Screen
          </button>
          <button
            type="button"
            className="install-prompt-dismiss"
            onClick={dismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // iOS — manual share sheet instructions
  if (showIosHint) {
    return (
      <div className="install-prompt" role="complementary">
        <span className="install-prompt-text">
          <MobileIcon
            className="install-prompt-mobile-icon"
            aria-hidden="true"
          />
          Tap{" "}
          <span className="install-prompt-share-icon" aria-label="Share">
            ⬆
          </span>{" "}
          then <strong>Add to Home Screen</strong> to install TerraInk
        </span>
        <button
          type="button"
          className="install-prompt-dismiss"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}
