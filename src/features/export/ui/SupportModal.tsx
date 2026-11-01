import { createPortal } from "react-dom";
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
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        <div className="support-modal__body">
          <p className="support-modal__headline" id={titleId}>
            ✨ Your poster is ready!
          </p>
          <p className="support-modal__text">
            Follow Terraink on Instagram for fresh map ideas, design tips, and the
            latest features — and show off the posters you make.
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
                <InstagramIcon /> Follow us
              </a>
            ) : (
              <button
                type="button"
                className="support-modal__dismiss"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
