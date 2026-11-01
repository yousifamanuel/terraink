import { useState } from "react";
import {
  APP_VERSION,
  CONTACT_EMAIL,
  LEGAL_NOTICE_URL,
  PRIVACY_URL,
} from "@/core/config";
import { InfoIcon } from "@/shared/ui/Icons";
import {
  openLegalDoc,
  LEGAL_DOC_PAGES,
  type LegalDocType,
} from "@/features/legal/application/legalDoc";
import AttributionModal from "@/shared/ui/AttributionModal";
import MapAttributionLinks from "@/shared/ui/MapAttributionLinks";
import { trackEvent } from "@/shared/utils/analytics";

/**
 * Legal links point at the build-time static pages so they're real, crawlable
 * URLs, but a plain click opens the in-app modal instead. Modified clicks
 * (new tab/window, middle click) fall through to the static page.
 */
function handleLegalClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  doc: LegalDocType,
) {
  trackEvent(`${doc}_click`);
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
    return;
  }
  event.preventDefault();
  openLegalDoc(doc);
}

/** Reopens Google's consent dialog so visitors can withdraw or change consent. */
function handleCookieSettings() {
  const gfc = (window as any).googlefc;
  gfc?.callbackQueue?.push({
    CONSENT_DATA_READY: () => gfc.showRevocationMessage(),
  });
}

export default function FooterNote() {
  const appVersion = APP_VERSION;
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);
  const contactEmail = String(CONTACT_EMAIL ?? "").trim();
  // These vars hold the raw markdown URLs; the links open the in-app modal.
  const imprintAvailable = Boolean(String(LEGAL_NOTICE_URL ?? "").trim());
  const privacyAvailable = Boolean(String(PRIVACY_URL ?? "").trim());
  const hasLegalLinks = Boolean(
    contactEmail || imprintAvailable || privacyAvailable,
  );

  return (
    <footer className="app-footer desktop-footer">
      <div className="desktop-footer-left">
        <p className="source-note">
          {contactEmail && (
            <a
              className="source-link"
              href={`mailto:${contactEmail}`}
              onClick={() => trackEvent("email_click")}
            >
              {contactEmail}
            </a>
          )}
          {contactEmail && (imprintAvailable || privacyAvailable) && " | "}
          {imprintAvailable && (
            <a
              className="source-link"
              href={LEGAL_DOC_PAGES.imprint}
              onClick={(event) => handleLegalClick(event, "imprint")}
            >
              Imprint
            </a>
          )}
          {imprintAvailable && privacyAvailable && " | "}
          {privacyAvailable && (
            <a
              className="source-link"
              href={LEGAL_DOC_PAGES.privacy}
              onClick={(event) => handleLegalClick(event, "privacy")}
            >
              Data Privacy
            </a>
          )}
          {hasLegalLinks && " | "}
          <button
            type="button"
            className="source-link"
            onClick={() => {
              trackEvent("cookie_settings_click");
              handleCookieSettings();
            }}
          >
            Cookie Settings
          </button>
        </p>
      </div>

      <div className="desktop-footer-middle">
        <p className="made-note">
          Terraink™ v{appVersion} | © 2026 | Made with{" "}
          <span className="heart">❤︎</span> in Hannover, Germany
        </p>
      </div>

      <div className="desktop-footer-right">
        <p className="source-note">
          Map data &copy;{" "}
          <a
            className="source-link"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap contributors
          </a>
        </p>
        {/* Desktop: opens the attribution modal (hidden on mobile via CSS). */}
        <button
          type="button"
          className="desktop-footer-info-btn"
          aria-label="More map attribution"
          aria-haspopup="dialog"
          aria-expanded={isAttributionOpen}
          onClick={() => {
            trackEvent("attribution_opened");
            setIsAttributionOpen(true);
          }}
        >
          <InfoIcon />
        </button>
        {/* Mobile: shown inline inside the settings drawer (CSS controls it). */}
        <div className="desktop-footer-attribution">
          <MapAttributionLinks />
        </div>
      </div>

      {isAttributionOpen && (
        <AttributionModal onClose={() => setIsAttributionOpen(false)} />
      )}
    </footer>
  );
}
