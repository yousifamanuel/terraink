import { useEffect } from "react";
import { createPortal } from "react-dom";
import ThemeCard from "./ThemeCard";

export default function ThemeModal({
  open,
  themeOptions,
  selectedThemeId,
  onSelectTheme,
  onClose,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
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

  const modalMarkup = (
    <div
      className="theme-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="theme-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="theme-modal-header">
          <h3 id="theme-modal-title">Choose Theme</h3>
          <button
            type="button"
            className="theme-modal-close"
            onClick={onClose}
            aria-label="Close theme picker"
          >
            x
          </button>
        </div>

        <div className="theme-modal-list">
          {themeOptions.map((themeOption) => (
            <ThemeCard
              key={themeOption.id}
              themeOption={themeOption}
              isSelected={themeOption.id === selectedThemeId}
              onClick={() => onSelectTheme(themeOption.id)}
            />
          ))}
        </div>

        <div className="theme-modal-footer">
          <button
            type="button"
            className="theme-modal-done"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}
