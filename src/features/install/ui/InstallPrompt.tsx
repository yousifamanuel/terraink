import useInstallPrompt from "../application/useInstallPrompt";
import { FaMobileAlt as MobileIcon } from "react-icons/fa";
import { FiShare as ShareIcon } from "react-icons/fi";
import React, { useState } from "react";
import { INSTALL_DIAGNOSTICS_ENABLED } from "@/core/config";
import { useLocale } from "@/core/i18n/LocaleContext";

export default function InstallPrompt() {
  const { t } = useLocale();
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
            {t("install.prompt.deferredBody")}
          </span>
          <div className="install-prompt-actions">
            <button
              type="button"
              className="install-prompt-btn"
              onClick={handleInstall}
            >
              {t("install.prompt.addToHomeScreen")}
            </button>
            <button
              type="button"
              className="install-prompt-dismiss"
              onClick={dismiss}
            >
              {t("install.prompt.maybeLater")}
            </button>
            {INSTALL_DIAGNOSTICS_ENABLED ? (
              <button
                type="button"
                className="install-prompt-dismiss"
                onClick={() => setIsDiagnosticsOpen(true)}
              >
                {t("install.prompt.diagnostics")}
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
            {t("install.prompt.iosTap")}{" "}
            <span className="install-prompt-share-icon" aria-hidden="true">
              <ShareIcon />
            </span>{" "}
            {t("install.prompt.iosAfterShare")}{" "}
            <strong>{t("install.prompt.addToHomeScreen")}</strong>{" "}
            {t("install.prompt.iosBodySuffix")}
          </span>
          <div className="install-prompt-actions">
            <button
              type="button"
              className="install-prompt-dismiss"
              onClick={dismiss}
            >
              {t("install.prompt.maybeLater")}
            </button>
            {INSTALL_DIAGNOSTICS_ENABLED ? (
              <button
                type="button"
                className="install-prompt-dismiss"
                onClick={() => setIsDiagnosticsOpen(true)}
              >
                {t("install.prompt.diagnostics")}
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
            {t("install.prompt.androidBody")}{" "}
            <strong>{t("install.prompt.androidInstallApp")}</strong>{" "}
            {t("install.prompt.androidOr")}{" "}
            <strong>{t("install.prompt.addToHomeScreen")}</strong>
          </span>
          <div className="install-prompt-actions">
            <button
              type="button"
              className="install-prompt-dismiss"
              onClick={dismiss}
            >
              {t("install.prompt.maybeLater")}
            </button>
            {INSTALL_DIAGNOSTICS_ENABLED ? (
              <button
                type="button"
                className="install-prompt-dismiss"
                onClick={() => setIsDiagnosticsOpen(true)}
              >
                {t("install.prompt.diagnostics")}
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
  const { t } = useLocale();

  return (
    <div className="install-help-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="install-help-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t("install.diagnostics.ariaLabel")}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="install-help-modal-title">{t("install.diagnostics.title")}</h3>
        <pre className="install-help-modal-text">{diagnosticsText}</pre>
        <div className="install-prompt-actions">
          <button type="button" className="install-prompt-dismiss" onClick={onClose}>
            {t("install.diagnostics.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
