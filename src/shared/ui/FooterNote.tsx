import { APP_VERSION, CONTACT_EMAIL, LEGAL_NOTICE_URL, PRIVACY_URL } from "@/core/config";
import { InfoIcon } from "@/shared/ui/Icons";

function handleCookieSettings() {
  const gfc = (window as any).googlefc;
  gfc?.callbackQueue?.push({
    CONSENT_DATA_READY: () => gfc.showRevocationMessage(),
  });
}

export default function FooterNote() {
  const appVersion = APP_VERSION;
  const contactEmail = String(CONTACT_EMAIL ?? "").trim();
  const legalNoticeUrl = String(LEGAL_NOTICE_URL ?? "").trim();
  const privacyUrl = String(PRIVACY_URL ?? "").trim();
  const hasLegalLinks = Boolean(contactEmail || legalNoticeUrl || privacyUrl);

  return (
    <footer className="app-footer desktop-footer">
      <div className="desktop-footer-left">
        <p className="source-note">
          {contactEmail && (
            <a className="source-link" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          )}
          {contactEmail && (legalNoticeUrl || privacyUrl) && " | "}
          {legalNoticeUrl && (
            <a
              className="source-link"
              href={legalNoticeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Imprint
            </a>
          )}
          {legalNoticeUrl && privacyUrl && " | "}
          {privacyUrl && (
            <a
              className="source-link"
              href={privacyUrl}
              target="_blank"
              rel="noreferrer"
            >
              Data Privacy
            </a>
          )}
          {hasLegalLinks && " | "}
          <button
            type="button"
            className="source-link"
            onClick={handleCookieSettings}
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
        <button
          type="button"
          className="desktop-footer-info-btn"
          aria-label="More map attribution"
          aria-expanded="false"
        >
          <InfoIcon />
        </button>
        <div className="desktop-footer-attribution">
          Tiles &copy;{" "}
          <a
            className="source-link"
            href="https://openmaptiles.org/"
            target="_blank"
            rel="noreferrer"
          >
            OpenMapTiles
          </a>
          {" | "}Powered by{" "}
          <a
            className="source-link"
            href="https://openfreemap.org/"
            target="_blank"
            rel="noreferrer"
          >
            OpenFreeMap
          </a>
          {", "}
          <a
            className="source-link"
            href="https://nominatim.openstreetmap.org/"
            target="_blank"
            rel="noreferrer"
          >
            Nominatim
          </a>
          {" & "}
          <a
            className="source-link"
            href="https://maplibre.org/"
            target="_blank"
            rel="noreferrer"
          >
            MapLibre
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
