import { createPortal } from "react-dom";
import { CloseIcon } from "@/shared/ui/Icons";

interface AdBlockModalProps {
  variant: "warning" | "limit";
  hoursUntilReset?: number;
  onClose: () => void;
}

export default function AdBlockModal({
  variant,
  hoursUntilReset = 24,
  onClose,
}: AdBlockModalProps) {
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
        aria-labelledby="adblock-modal-title"
        onClick={(e) => e.stopPropagation()}
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
          {variant === "warning" ? (
            <>
              <p className="support-modal__headline" id="adblock-modal-title">
                Ads keep Terraink free
              </p>
              <p className="support-modal__text">
                Terraink is 100% free. Ads help cover server and development
                costs — please consider disabling your ad blocker to support
                the project.
              </p>
              <p className="support-modal__text">
                With an ad blocker active you get{" "}
                <strong>1 free download per day</strong>.
              </p>
              <div className="support-modal__actions">
                <button
                  type="button"
                  className="support-modal__dismiss"
                  onClick={onClose}
                >
                  Got it
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="support-modal__headline" id="adblock-modal-title">
                Daily limit reached
              </p>
              <p className="support-modal__text">
                You've used your free download for today. Disable your ad
                blocker for unlimited downloads.
              </p>
              <p className="support-modal__text">
                Resets in <strong>~{hoursUntilReset}h</strong>.
              </p>
              <div className="support-modal__actions">
                <button
                  type="button"
                  className="support-modal__dismiss"
                  onClick={onClose}
                >
                  OK
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
