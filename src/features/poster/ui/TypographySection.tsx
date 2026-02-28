import { useState } from "react";
import { createPortal } from "react-dom";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { FontOption } from "@/core/config";
import {
  PLACEHOLDER_EXAMPLE_CITY,
  PLACEHOLDER_EXAMPLE_COUNTRY,
} from "@/features/location/ui/constants";

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  fontOptions: FontOption[];
  onCreditsChange: (value: boolean) => void;
}

function CreditsRemovalModal({
  onKeep,
  onRemove,
}: {
  onKeep: () => void;
  onRemove: () => void;
}) {
  return createPortal(
    <div className="picker-modal-backdrop" role="presentation" onClick={onKeep}>
      <div
        className="picker-modal credits-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="credits-modal-body">
          <p className="credits-modal-headline" id="credits-modal-title">
            ✨ Wait! Did you know Terraink is open-source?
          </p>
          <p className="credits-modal-text">
            Keeping the credit visible helps more people find this tool and
            allows me to keep it <strong>100% free</strong> and client-side.
          </p>
          <div className="credits-modal-actions">
            <button
              type="button"
              className="credits-modal-keep"
              onClick={onKeep}
            >
              <span className="heart">❤︎</span> Keep Credits
            </button>
            <button
              type="button"
              className="credits-modal-remove"
              onClick={onRemove}
            >
              Remove Anyway
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function TypographySection({
  form,
  onChange,
  fontOptions,
  onCreditsChange,
}: TypographySectionProps) {
  const [includeCreditsModal, setIncludeCreditsModal] = useState(false);

  function handleCreditsToggle(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.checked) {
      setIncludeCreditsModal(true);
    } else {
      onCreditsChange(true);
    }
  }

  function handleKeepCredits() {
    setIncludeCreditsModal(false);
  }

  function handleRemoveCredits() {
    setIncludeCreditsModal(false);
    onCreditsChange(false);
  }

  return (
    <>
      {includeCreditsModal && (
        <CreditsRemovalModal
          onKeep={handleKeepCredits}
          onRemove={handleRemoveCredits}
        />
      )}
      <section className="panel-block">
        <h2>Typography</h2>
        <label className="toggle-field">
          <span>Poster text</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              name="showPosterText"
              checked={Boolean(form.showPosterText)}
              onChange={onChange}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>

        <div className="field-grid keep-two-mobile">
          <label>
            Display city
            <input
              className="form-control-tall"
              name="displayCity"
              value={form.displayCity}
              onChange={onChange}
              placeholder={PLACEHOLDER_EXAMPLE_CITY}
            />
          </label>
          <label>
            Display country
            <input
              className="form-control-tall"
              name="displayCountry"
              value={form.displayCountry}
              onChange={onChange}
              placeholder={PLACEHOLDER_EXAMPLE_COUNTRY}
            />
          </label>
        </div>
        <label>
          Font
          <select
            className="form-control-tall"
            name="fontFamily"
            value={form.fontFamily}
            onChange={onChange}
          >
            {fontOptions.map((fontOption) => (
              <option
                key={fontOption.value || "default"}
                value={fontOption.value}
              >
                {fontOption.label}
              </option>
            ))}
          </select>
        </label>

        <label className="toggle-field credits-toggle-field">
          <span>Include Credits</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              name="includeCredits"
              checked={Boolean(form.includeCredits)}
              onChange={handleCreditsToggle}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>
        <p className="credits-hint">
          Keep this enabled to help others discover this open-source project and
          support future updates!
        </p>
      </section>
    </>
  );
}
