import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trans, useTranslation } from "react-i18next";
import { CloseIcon } from "@/shared/ui/Icons";

interface SaveChoiceModalProps {
  themeName: string;
  onSave: () => void;
  onSaveAsCopy: () => void;
  onCancel: () => void;
}

export default function SaveChoiceModal({
  themeName,
  onSave,
  onSaveAsCopy,
  onCancel,
}: SaveChoiceModalProps) {
  const { t } = useTranslation();
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return createPortal(
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="picker-modal save-choice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-choice-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="picker-modal-header">
          <h3 id="save-choice-modal-title">{t("theme.choiceModal.title")}</h3>
          <button
            type="button"
            className="picker-modal-close"
            onClick={onCancel}
            aria-label={t("theme.choiceModal.cancel")}
          >
            <CloseIcon />
          </button>
        </div>

        <p className="save-choice-message">
          <Trans
            i18nKey="theme.choiceModal.message"
            values={{ themeName }}
            components={{ strong: <strong /> }}
          />
        </p>

        <div className="save-choice-actions">
          <button
            type="button"
            className="save-theme-cancel"
            onClick={onSaveAsCopy}
          >
            {t("theme.choiceModal.saveAsCopy")}
          </button>
          <button
            type="button"
            className="save-theme-confirm"
            onClick={onSave}
          >
            {t("theme.choiceModal.save")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
