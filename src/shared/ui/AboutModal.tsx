import { createPortal } from "react-dom";
import InfoPanel from "./InfoPanel";
import { CloseIcon } from "./Icons";

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
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
        aria-label="About Terraink"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="about-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        <InfoPanel />
      </div>
    </div>,
    document.body,
  );
}
