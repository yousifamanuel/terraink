import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/shared/ui/Icons";

interface SaveThemeModalProps {
  suggestedName: string;
  suggestedDescription: string;
  existingNames: string[];
  onConfirm: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function SaveThemeModal({
  suggestedName,
  suggestedDescription,
  existingNames,
  onConfirm,
  onCancel,
}: SaveThemeModalProps) {
  const [name, setName] = useState(suggestedName);
  const [description, setDescription] = useState(suggestedDescription);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const existingNameSet = useMemo(
    () => new Set(existingNames.map((n) => n.trim().toLowerCase())),
    [existingNames],
  );

  const trimmedName = name.trim();
  const isEmpty = trimmedName.length === 0;
  const isDuplicate =
    !isEmpty && existingNameSet.has(trimmedName.toLowerCase());
  const isInvalid = isEmpty || isDuplicate;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isInvalid) return;
    onConfirm(trimmedName, description.trim());
  }

  return createPortal(
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="picker-modal save-theme-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-theme-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="picker-modal-header">
          <h3 id="save-theme-modal-title">Save Theme</h3>
          <button
            type="button"
            className="picker-modal-close"
            onClick={onCancel}
            aria-label="Cancel"
          >
            <CloseIcon />
          </button>
        </div>

        <form className="save-theme-modal-body" onSubmit={handleSubmit}>
          <label className="save-theme-field">
            <span className="save-theme-field-label">Name</span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              aria-invalid={isDuplicate}
            />
          </label>

          <label className="save-theme-field">
            <span className="save-theme-field-label">Description</span>
            <textarea
              className="save-theme-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={240}
              rows={3}
            />
          </label>

          <p className="save-theme-hint">
            Pick a unique name to find the theme later.
          </p>
          {isDuplicate ? (
            <p className="save-theme-error" role="alert">
              A saved theme with this name already exists.
            </p>
          ) : null}

          <div className="save-theme-actions">
            <button
              type="button"
              className="save-theme-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-theme-confirm"
              disabled={isInvalid}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
