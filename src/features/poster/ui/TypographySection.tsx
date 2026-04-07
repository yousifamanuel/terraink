import { useEffect } from "react";
import { ensureGoogleFont } from "@/core/services";
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
  onFieldChange: (name: string, value: string | boolean) => void;
}


const FONT_SCALES = [
  { label: "S", value: "0.75" },
  { label: "M", value: "1" },
  { label: "L", value: "1.25" },
  { label: "XL", value: "1.5" },
];

const ALIGN_OPTIONS: { label: string; value: 'left' | 'center' | 'right'; title: string }[] = [
  { label: "\u2190", value: "left", title: "Align left" },
  { label: "\u2194", value: "center", title: "Align center" },
  { label: "\u2192", value: "right", title: "Align right" },
];

const VALIGN_OPTIONS: { label: string; value: 'top' | 'middle' | 'bottom'; title: string }[] = [
  { label: "Top", value: "top", title: "Position top" },
  { label: "Mid", value: "middle", title: "Position middle" },
  { label: "Bot", value: "bottom", title: "Position bottom" },
];

export default function TypographySection({
  form,
  onChange,
  fontOptions,
  onFieldChange,
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

        {form.showPosterText && (
          <>
            <div className="text-options-row">
              <span className="text-options-label">Alignment</span>
              <div className="text-align-group" role="group" aria-label="Text alignment">
                {ALIGN_OPTIONS.map(({ label, value, title }) => (
                  <button
                    key={value}
                    type="button"
                    className={`text-align-btn${form.textAlign === value ? " is-active" : ""}`}
                    title={title}
                    onClick={() => onFieldChange("textAlign", value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-options-row">
              <span className="text-options-label">Position</span>
              <div className="text-align-group" role="group" aria-label="Text vertical position">
                {VALIGN_OPTIONS.map(({ label, value, title }) => (
                  <button
                    key={value}
                    type="button"
                    className={`text-align-btn${form.textVerticalAlign === value ? " is-active" : ""}`}
                    title={title}
                    onClick={() => onFieldChange("textVerticalAlign", value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="font-scale-group">
              <div className="font-scale-row">
                <span className="font-scale-label">City size</span>
                <div className="font-scale-btns" role="group" aria-label="City font size">
                  {FONT_SCALES.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      className={`font-scale-btn${form.cityFontScale === value ? " is-active" : ""}`}
                      onClick={() => onFieldChange("cityFontScale", value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="font-scale-row">
                <span className="font-scale-label">Country size</span>
                <div className="font-scale-btns" role="group" aria-label="Country font size">
                  {FONT_SCALES.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      className={`font-scale-btn${form.countryFontScale === value ? " is-active" : ""}`}
                      onClick={() => onFieldChange("countryFontScale", value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="font-scale-row">
                <span className="font-scale-label">Coords size</span>
                <div className="font-scale-btns" role="group" aria-label="Coordinates font size">
                  {FONT_SCALES.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      className={`font-scale-btn${form.coordsFontScale === value ? " is-active" : ""}`}
                      onClick={() => onFieldChange("coordsFontScale", value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

      </section>
    </>
  );
}
