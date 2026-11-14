import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ensureFont } from "@/core/services";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { FontOption } from "@/core/config";
import { COORDINATE_FORMATS, formatCoordinates } from "@/shared/geo/posterBounds";
import CoordinateSeparatorPicker from "./CoordinateSeparatorPicker";
import {
  PLACEHOLDER_EXAMPLE_CITY,
  PLACEHOLDER_EXAMPLE_COUNTRY,
} from "@/features/location/ui/constants";
import {
  POSTER_STYLE_TEMPLATES,
  type PosterStyleTemplateId,
} from "@/features/poster/domain/posterStyleTemplates";

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onPosterStyleTemplateChange: (templateId: PosterStyleTemplateId) => void;
  fontOptions: FontOption[];
}

export default function TypographySection({
  form,
  onChange,
  onPosterStyleTemplateChange,
  fontOptions,
}: TypographySectionProps) {
  const { t } = useTranslation();
  const previewsRequested = useRef(false);
  const exampleLat = Number(form.latitude) || 0;
  const exampleLon = Number(form.longitude) || 0;

  // Each <option> previews itself in its own typeface, which means every family
  // has to be loaded for the dropdown to look right. That is a lot of bytes for
  // the many users who never change the font, so hold off until they actually
  // reach for the control rather than paying it on mount.
  const preloadFontPreviews = useCallback(() => {
    if (previewsRequested.current) return;
    previewsRequested.current = true;

    const families = fontOptions
      .map((option) => String(option.value || "").trim())
      .filter(Boolean);

    void Promise.allSettled(families.map((family) => ensureFont(family)));
  }, [fontOptions]);

  return (
    <>
      <section className="panel-block">
        <p className="section-summary-label">{t("poster.typography.style")}</p>
        <div className="poster-style-template-grid" role="list">
          {POSTER_STYLE_TEMPLATES.map((template) => {
            const isSelected = form.posterStyleTemplate === template.id;
            return (
              <button
                key={template.id}
                type="button"
                className={`poster-style-template-card poster-style-template-card--${template.id}${isSelected ? " is-selected" : ""}`}
                onClick={() => onPosterStyleTemplateChange(template.id)}
                aria-pressed={isSelected}
              >
                <span className="poster-style-template-preview" aria-hidden="true">
                  <span className="poster-style-template-map" />
                  <span className="poster-style-template-frame" />
                  <span className="poster-style-template-panel" />
                  <span className="poster-style-template-title" />
                  <span className="poster-style-template-line" />
                  <span className="poster-style-template-meta" />
                </span>
                <span className="poster-style-template-copy">
                  <span className="poster-style-template-name">
                    {template.name}
                  </span>
                  <span className="poster-style-template-description">
                    {template.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <label className="toggle-field">
          <span>{t("poster.typography.posterText")}</span>
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
          <span>{t("poster.typography.overlayLayer")}</span>
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
            {t("poster.typography.displayCity")}
            <input
              className="form-control-tall"
              name="displayCity"
              value={form.displayCity}
              onChange={onChange}
              placeholder={PLACEHOLDER_EXAMPLE_CITY}
            />
          </label>
          <label>
            {t("poster.typography.displayCountry")}
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
          {t("poster.typography.font")}
          <select
            className="form-control-tall"
            name="fontFamily"
            value={form.fontFamily}
            onChange={onChange}
            onFocus={preloadFontPreviews}
            onMouseDown={preloadFontPreviews}
            onTouchStart={preloadFontPreviews}
          >
            {fontOptions.map((fontOption) => (
              <option
                key={fontOption.value || "default"}
                value={fontOption.value}
                style={{
                  fontFamily: fontOption.value
                    ? `"${fontOption.value}", "Space Grotesk", sans-serif`
                    : `"Space Grotesk", sans-serif`,
                }}
              >
                {fontOption.value ? fontOption.label : t("poster.typography.defaultFont")}
              </option>
            ))}
          </select>
        </label>
        <label className="toggle-field">
          <span>{t("poster.typography.coordinates")}</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              name="showCoordinates"
              checked={Boolean(form.showCoordinates)}
              onChange={onChange}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>
        {form.showCoordinates ? (
          <>
            <select
              className="form-control-tall"
              name="coordinateFormat"
              value={form.coordinateFormat}
              onChange={onChange}
              aria-label={t("poster.typography.coordinates")}
            >
              {COORDINATE_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {/* The example is the label: same in every language. */}
                  {formatCoordinates(exampleLat, exampleLon, {
                    format,
                    separator: form.coordinateSeparator,
                  })}
                </option>
              ))}
            </select>
            <CoordinateSeparatorPicker value={form.coordinateSeparator} />
          </>
        ) : null}

      </section>
    </>
  );
}
