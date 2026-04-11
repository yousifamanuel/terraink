import useInstallPrompt from "../application/useInstallPrompt";
import { FaMobileAlt as MobileIcon } from "react-icons/fa";
import { FiShare as ShareIcon } from "react-icons/fi";
import React, { useState } from "react";
import { INSTALL_DIAGNOSTICS_ENABLED } from "@/core/config";

export default function InstallPrompt() {
  const {
    deferredPrompt,
    showIosHint,
    showAndroidHint,
    dismissed,
    dismiss,
    handleInstall,
    diagnostics,
  } = useInstallPrompt();
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const diagnosticsText = JSON.stringify(diagnostics, null, 2);

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <>
        <div className="install-prompt" role="complementary">
          <span className="install-prompt-text">
            <MobileIcon
              className="install-prompt-mobile-icon"
              aria-hidden="true"
            />
            Install Terraink for faster access and a better experience.
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
            {INSTALL_DIAGNOSTICS_ENABLED ? (
              <button
                type="button"
                className="install-prompt-dismiss"
                onClick={() => setIsDiagnosticsOpen(true)}
              >
                Diagnostics
              </button>
            ) : null}
          </div>
        </div>
        {INSTALL_DIAGNOSTICS_ENABLED && isDiagnosticsOpen ? (
          <DiagnosticsModal
            diagnosticsText={diagnosticsText}
            onClose={() => setIsDiagnosticsOpen(false)}
          />
        ) : null}
      </>
    );
  }

  if (showIosHint) {
    return (
      <>
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
            then <strong>Add to Home Screen</strong> for faster access and a
            better experience.
          </span>
          <div className="install-prompt-actions">
            <button
              type="button"
              className="install-prompt-dismiss"
              onClick={dismiss}
            >
              Maybe later
            </button>
            {INSTALL_DIAGNOSTICS_ENABLED ? (
              <button
                type="button"
                className="install-prompt-dismiss"
                onClick={() => setIsDiagnosticsOpen(true)}
              >
                Diagnostics
              </button>
            ) : null}
          </div>
        </div>
        {INSTALL_DIAGNOSTICS_ENABLED && isDiagnosticsOpen ? (
          <DiagnosticsModal
            diagnosticsText={diagnosticsText}
            onClose={() => setIsDiagnosticsOpen(false)}
          />
        ) : null}
      </>
    );
  }

  if (showAndroidHint) {
    return (
      <>
        <div className="install-prompt" role="complementary">
          <span className="install-prompt-text">
            <MobileIcon
              className="install-prompt-mobile-icon"
              aria-hidden="true"
            />
            For faster access and a better experience, install Terraink from
            your browser menu:
            <strong> Install app </strong>
            or
            <strong> Add to Home screen</strong>
          </span>
          <div className="install-prompt-actions">
            <button
              type="button"
              className="install-prompt-dismiss"
              onClick={dismiss}
            >
              Maybe later
            </button>
            {INSTALL_DIAGNOSTICS_ENABLED ? (
              <button
                type="button"
                className="install-prompt-dismiss"
                onClick={() => setIsDiagnosticsOpen(true)}
              >
                Diagnostics
              </button>
            ) : null}
          </div>
        </div>
        {INSTALL_DIAGNOSTICS_ENABLED && isDiagnosticsOpen ? (
          <DiagnosticsModal
            diagnosticsText={diagnosticsText}
            onClose={() => setIsDiagnosticsOpen(false)}
          />
        ) : null}
      </>
    );
  }

  return null;
}

function DiagnosticsModal({
  diagnosticsText,
  onClose,
}: {
  diagnosticsText: string;
  onClose: () => void;
}) {
  return (
    <div className="install-help-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="install-help-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Install diagnostics"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="install-help-modal-title">Install Diagnostics</h3>
        <pre className="install-help-modal-text">{diagnosticsText}</pre>
        <div className="install-prompt-actions">
          <button type="button" className="install-prompt-dismiss" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
