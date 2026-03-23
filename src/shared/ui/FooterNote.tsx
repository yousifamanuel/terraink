import { CONTACT_EMAIL, LEGAL_NOTICE_URL, PRIVACY_URL } from "@/core/config";
import { useLocale } from "@/core/i18n/LocaleContext";
import { InfoIcon } from "@/shared/ui/Icons";

export default function FooterNote() {
  const { t } = useLocale();
  const appVersion = String(import.meta.env.VITE_APP_VERSION ?? "0.0.0").trim();
  const contactEmail = String(CONTACT_EMAIL ?? "").trim();
  const legalNoticeUrl = String(LEGAL_NOTICE_URL ?? "").trim();
  const privacyUrl = String(PRIVACY_URL ?? "").trim();
  const hasLegal = Boolean(contactEmail || legalNoticeUrl || privacyUrl);

  return (
    <footer className="app-footer desktop-footer">
      <div className="desktop-footer-left">
        {hasLegal ? (
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
                {t("footer.imprint")}
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
                {t("footer.privacy")}
              </a>
            )}
          </p>
        ) : null}
      </div>

      <div className="desktop-footer-middle">
        <p className="made-note">
          Terraink™ v{appVersion} | © 2026 | {t("footer.madeWith")}{" "}
          <span className="heart">❤︎</span> {t("footer.location")}
        </p>
      </div>

      <div className="desktop-footer-right">
        <p className="source-note">
          {t("footer.mapData")} &copy;{" "}
          <a
            className="source-link"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            {t("footer.openStreetMapContributors")}
          </a>
        </p>
        <button
          type="button"
          className="desktop-footer-info-btn"
          aria-label={t("footer.moreAttribution")}
          aria-expanded="false"
        >
          <InfoIcon />
        </button>
        <div className="desktop-footer-attribution">
          {t("footer.tiles")} &copy;{" "}
          <a
            className="source-link"
            href="https://openmaptiles.org/"
            target="_blank"
            rel="noreferrer"
          >
            OpenMapTiles
          </a>
          {" | "}{t("footer.poweredBy")}{" "}
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
