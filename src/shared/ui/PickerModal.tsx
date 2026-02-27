import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PickerModalProps {
  open: boolean;
  title: string;
  titleId?: string;
  onClose: () => void;
  doneLabel?: string;
  children: ReactNode;
}

export default function PickerModal({
  open,
  title,
  titleId,
  onClose,
  doneLabel = "Done",
  children,
}: PickerModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const resolvedTitleId = titleId || "picker-modal-title";

  const modalMarkup = (
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="picker-modal-header">
          <h3 id={resolvedTitleId}>{title}</h3>
          <button
            type="button"
            className="picker-modal-close"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            x
          </button>
        </div>

        <div className="picker-modal-body">{children}</div>

        <div className="picker-modal-footer">
          <button type="button" className="picker-modal-done" onClick={onClose}>
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}
