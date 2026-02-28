import useInstallPrompt from "../application/useInstallPrompt";
import { FaMobileAlt as MobileIcon } from "react-icons/fa";
import { FiShare2 as ShareIcon } from "react-icons/fi";
import React from "react";

export default function InstallPrompt() {
  const { deferredPrompt, showIosHint, dismissed, dismiss, handleInstall } =
    useInstallPrompt();

  if (dismissed) return null;

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
          >
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <div className="install-prompt" role="complementary">
        <span className="install-prompt-text">
          <MobileIcon
            className="install-prompt-mobile-icon"
            aria-hidden="true"
          />
          Tap{" "}
          <span className="install-prompt-share-icon" aria-hidden="true">
            <ShareIcon />
          </span>{" "}
          then <strong>Add to Home Screen</strong> to install TerraInk for quick
          access
        </span>
        <button
          type="button"
          className="install-prompt-dismiss"
          onClick={dismiss}
        >
          Maybe later
        </button>
      </div>
    );
  }

  return null;
}
