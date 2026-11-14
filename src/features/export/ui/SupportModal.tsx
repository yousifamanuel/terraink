import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { SOCIAL_INSTAGRAM } from "@/core/config";
import { CloseIcon, InstagramIcon } from "@/shared/ui/Icons";
import { trackEvent } from "@/shared/utils/analytics";

interface SupportModalProps {
  posterNumber: number;
  onClose: () => void;
  titleId?: string;
}

export default function SupportModal({
  posterNumber,
  onClose,
  titleId = "export-support-modal-title",
}: SupportModalProps) {
  const { t } = useTranslation();
  const instagramUrl = String(SOCIAL_INSTAGRAM ?? "").trim();

  return createPortal(
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="picker-modal support-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="support-modal__close"
          onClick={onClose}
          aria-label={t("export.support.close")}
        >
          <CloseIcon />
        </button>
        <div className="support-modal__body">
          <p className="support-modal__headline" id={titleId}>
            {t("export.support.headline")}
          </p>
          <p className="support-modal__text">
            {t("export.support.text")}
          </p>
          <div className="support-modal__actions">
            {instagramUrl ? (
              <a
                className="support-modal__instagram"
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("follow_click")}
              >
                <InstagramIcon /> {t("export.support.followUs")}
              </a>
            ) : (
              <button
                type="button"
                className="support-modal__dismiss"
                onClick={onClose}
              >
                {t("export.support.close")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
