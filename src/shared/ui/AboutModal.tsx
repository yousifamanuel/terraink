import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import InfoPanel from "./InfoPanel";
import { CloseIcon } from "./Icons";

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
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
        <InfoPanel />
      </div>
    </div>,
    document.body,
  );
}
