import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import InfoPanel from "./InfoPanel";
import { CloseIcon, NewsIcon } from "./Icons";

interface AboutModalProps {
  onClose: () => void;
  /** Opens the release notes; the row only shows on mobile. */
  onNewsOpen?: () => void;
}

export default function AboutModal({ onClose, onNewsOpen }: AboutModalProps) {
  const { t } = useTranslation();
  return createPortal(
    <div
      className="about-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="about-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t("shell.about.dialog")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="about-modal-close"
          onClick={onClose}
          aria-label={t("shell.common.close")}
        >
          <CloseIcon />
        </button>
        {onNewsOpen ? (
          <button type="button" className="about-news-row" onClick={onNewsOpen}>
            <NewsIcon aria-hidden="true" />
            <span>{t("shell.nav.news")}</span>
          </button>
        ) : null}
        <InfoPanel />
      </div>
    </div>,
    document.body,
  );
}
