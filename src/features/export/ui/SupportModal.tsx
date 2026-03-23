import { createPortal } from "react-dom";
import { useLocale } from "@/core/i18n/LocaleContext";
import { KOFI_URL } from "@/core/config";

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
  const { t } = useLocale();
  const kofiUrl = String(KOFI_URL ?? "").trim();

  return createPortal(
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="picker-modal credits-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        >
          <div className="credits-modal-body">
            <p className="credits-modal-headline" id={titleId}>
              ✨ {t("export.support.headline")}
            </p>
            <p className="credits-modal-text">
              {t("export.support.body")}
            </p>
            <p className="credits-modal-text">
              {t("export.support.posterNumber", { posterNumber })} 🎉
            </p>
            <div className="credits-modal-actions">
              {kofiUrl ? (
              <a
                className="credits-modal-keep"
                href={kofiUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="heart">❤︎</span> {t("export.support.kofi")}
              </a>
            ) : null}
            <button
              type="button"
              className="credits-modal-remove"
              onClick={onClose}
            >
              {kofiUrl ? t("export.support.maybeLater") : t("export.support.close")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
