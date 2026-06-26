import { useEffect } from "react";
import { ensureGoogleFont } from "@/core/services";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { FontOption } from "@/core/config";
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
  onCreditsChange: (value: boolean) => void;
  onPosterStyleTemplateChange: (templateId: PosterStyleTemplateId) => void;
  fontOptions: FontOption[];
}

export default function TypographySection({
  form,
  onChange,
  onCreditsChange,
  onPosterStyleTemplateChange,
  fontOptions,
}: TypographySectionProps) {
  useEffect(() => {
    const families = fontOptions
      .map((option) => String(option.value || "").trim())
      .filter(Boolean);

    void Promise.allSettled(families.map((family) => ensureGoogleFont(family)));
  }, [fontOptions]);

  return (
    <>
      <section className="panel-block">
        <p className="section-summary-label">STYLE</p>
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
        <label className="toggle-field">
          <span>Overlay layer</span>
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
        <label className="toggle-field credits-toggle-field">
          <span>Terraink credit</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              name="includeCredits"
              checked={Boolean(form.includeCredits)}
              onChange={(event) => onCreditsChange(event.target.checked)}
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
                style={{
                  fontFamily: fontOption.value
                    ? `"${fontOption.value}", "Space Grotesk", sans-serif`
                    : `"Space Grotesk", sans-serif`,
                }}
              >
                {fontOption.label}
              </option>
            ))}
          </select>
        </label>
      </section>
    </>
  );
}
