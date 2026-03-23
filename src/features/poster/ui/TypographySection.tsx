import { useState } from "react";
import { createPortal } from "react-dom";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import {
  PLACEHOLDER_EXAMPLE_CITY,
  PLACEHOLDER_EXAMPLE_COUNTRY,
} from "@/features/location/ui/constants";
import { useLocale } from "@/core/i18n/LocaleContext";
import type {
  FontFamilyDefinition,
  FontVariantDefinition,
} from "@/core/fonts/types";

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  fontFamilies: FontFamilyDefinition[];
  fontVariants: FontVariantDefinition[];
  onCreditsChange: (value: boolean) => void;
}

function CreditsRemovalModal({
  onKeep,
  onRemove,
}: {
  onKeep: () => void;
  onRemove: () => void;
}) {
  const { t } = useLocale();
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
            {t("typography.creditsModal.headline")}
          </p>
          <p className="credits-modal-text">
            {t("typography.creditsModal.body")}
          </p>
          <div className="credits-modal-actions">
            <button
              type="button"
              className="credits-modal-keep"
              onClick={onKeep}
            >
              <span className="heart">❤︎</span> {t("typography.creditsKeep")}
            </button>
            <button
              type="button"
              className="credits-modal-remove"
              onClick={onRemove}
            >
              {t("typography.creditsRemove")}
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
  fontFamilies,
  fontVariants,
  onCreditsChange,
}: TypographySectionProps) {
  const { t } = useLocale();
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
        <p className="section-summary-label">{t("typography.section")}</p>
        <label className="toggle-field">
          <span>{t("typography.posterText")}</span>
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
        <label className="toggle-field">
          <span>{t("typography.overlay")}</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              name="showMarkers"
              checked={Boolean(form.showMarkers)}
              onChange={onChange}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>

        <div className="field-grid keep-two-mobile">
          <label>
            {t("typography.city")}
            <input
              className="form-control-tall"
              name="displayCity"
              value={form.displayCity}
              onChange={onChange}
              placeholder={t("location.placeholder.city") || PLACEHOLDER_EXAMPLE_CITY}
            />
          </label>
          <label>
            {t("typography.country")}
            <input
              className="form-control-tall"
              name="displayCountry"
              value={form.displayCountry}
              onChange={onChange}
              placeholder={
                t("location.placeholder.country") || PLACEHOLDER_EXAMPLE_COUNTRY
              }
            />
          </label>
        </div>
        <label>
          {t("typography.fontFamily")}
          <select
            className="form-control-tall"
            name="fontFamily"
            value={form.fontFamily}
            onChange={onChange}
            aria-label={t("typography.fontFamily")}
          >
            {fontFamilies.map((fontFamily) => (
              <option
                key={fontFamily.id || "default"}
                value={fontFamily.id}
              >
                {fontFamily.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("typography.fontStyle")}
          <select
            className="form-control-tall"
            name="fontVariant"
            value={form.fontVariant}
            onChange={onChange}
            aria-label={t("typography.fontStyle")}
          >
            {fontVariants.map((fontVariant) => (
              <option key={fontVariant.id} value={fontVariant.id}>
                {fontVariant.label}
              </option>
            ))}
          </select>
        </label>

        <label className="toggle-field credits-toggle-field">
          <span>{t("typography.includeCredits")}</span>
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
          {t("typography.creditsHint")}
        </p>
      </section>
    </>
  );
}
