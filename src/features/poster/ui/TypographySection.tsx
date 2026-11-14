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
  BORDER_DASHES,
  BORDER_LINES,
  BORDER_THICKNESS_MAX,
  BORDER_THICKNESS_MIN,
  BORDER_WIDTH_MAX,
  BORDER_WIDTH_MIN,
  DIVIDER_STYLES,
  DIVIDER_THICKNESS_MAX,
  DIVIDER_THICKNESS_MIN,
  POSTER_TEXT_ALIGNS,
  POSTER_TEXT_POSITIONS,
  TEXT_OFFSET_MAX,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
} from "@/features/poster/domain/posterStyleTemplates";
import SliderField from "@/shared/ui/SliderField";
import SegmentedControl from "@/shared/ui/SegmentedControl";
import { DEFAULT_FORM, usePosterContext } from "./PosterContext";
import { ResetIcon } from "@/shared/ui/Icons";

interface TypographySectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  fontOptions: FontOption[];
}

export default function TypographySection({
  form,
  onChange,
  fontOptions,
}: TypographySectionProps) {
  const { t } = useTranslation();
  const { dispatch } = usePosterContext();
  const setField = (name: string, value: string) =>
    dispatch({ type: "SET_FIELD", name, value });
  /** Every Style setting back to default; title/subtitle text stays (it comes from the location). */
  const styleDefaults = () => {
    const keys = [
      "textPosition",
      "textAlign",
      "showBorder",
      "borderWidth",
      "borderLine",
      "borderDash",
      "borderThickness",
      "showMarkers",
      "showPosterText",
      "titleSize",
      "subtitleSize",
      "textOffset",
      "showDivider",
      "dividerStyle",
      "dividerThickness",
      "fontFamily",
      "showCoordinates",
      "coordinateFormat",
      "coordinateSeparator",
    ] as const;
    return Object.fromEntries(keys.map((key) => [key, DEFAULT_FORM[key]]));
  };
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
        <div className="section-summary-head">
          <p className="section-summary-label">{t("poster.typography.style")}</p>
          <button
            type="button"
            className="section-reset-btn"
            title={t("poster.typography.resetStyle")}
            aria-label={t("poster.typography.resetStyle")}
            onClick={() => dispatch({ type: "SET_FORM_FIELDS", fields: styleDefaults() })}
          >
            <ResetIcon aria-hidden="true" />
          </button>
        </div>
        <SegmentedControl
          label={t("poster.typography.textPosition")}
          value={form.textPosition}
          options={POSTER_TEXT_POSITIONS.map((position) => ({
            value: position,
            label: t(`poster.typography.position.${position}`),
          }))}
          onChange={(value) => setField("textPosition", value)}
        />
        <SegmentedControl
          label={t("poster.typography.textAlign")}
          value={form.textAlign}
          options={POSTER_TEXT_ALIGNS.map((align) => ({
            value: align,
            label: t(`poster.typography.align.${align}`),
          }))}
          onChange={(value) => setField("textAlign", value)}
        />
        <label className="toggle-field">
          <span>{t("poster.typography.border")}</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              name="showBorder"
              checked={Boolean(form.showBorder)}
              onChange={onChange}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>
        {form.showBorder ? (
          <div className="toggle-subsettings">
            <SliderField
              label={t("poster.typography.borderWidth")}
              value={Number(form.borderWidth)}
              min={BORDER_WIDTH_MIN}
              max={BORDER_WIDTH_MAX}
              step={0.5}
              unit="%"
              defaultValue={Number(DEFAULT_FORM.borderWidth)}
              onChange={(value) => setField("borderWidth", String(value))}
            />
            <SegmentedControl
              label={t("poster.typography.borderLine")}
              value={form.borderLine}
              options={BORDER_LINES.map((line) => ({
                value: line,
                label: t(`poster.typography.line.${line}`),
              }))}
              onChange={(value) => setField("borderLine", value)}
            />
            <SegmentedControl
              label={t("poster.typography.borderStyle")}
              value={form.borderDash}
              options={BORDER_DASHES.map((dash) => ({
                value: dash,
                label: t(`poster.typography.dash.${dash}`),
              }))}
              onChange={(value) => setField("borderDash", value)}
            />
            <SliderField
              label={t("poster.typography.lineThickness")}
              value={Number(form.borderThickness)}
              min={BORDER_THICKNESS_MIN}
              max={BORDER_THICKNESS_MAX}
              step={0.05}
              unit="%"
              defaultValue={Number(DEFAULT_FORM.borderThickness)}
              onChange={(value) => setField("borderThickness", String(value))}
            />
          </div>
        ) : null}

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
        {form.showPosterText ? (
          <div className="toggle-subsettings">
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
            <SliderField
              label={t("poster.typography.titleSize")}
              value={Number(form.titleSize)}
              min={TEXT_SIZE_MIN}
              max={TEXT_SIZE_MAX}
              step={5}
              unit="%"
              defaultValue={Number(DEFAULT_FORM.titleSize)}
              onChange={(value) => setField("titleSize", String(value))}
            />
            <SliderField
              label={t("poster.typography.subtitleSize")}
              value={Number(form.subtitleSize)}
              min={TEXT_SIZE_MIN}
              max={TEXT_SIZE_MAX}
              step={5}
              unit="%"
              defaultValue={Number(DEFAULT_FORM.subtitleSize)}
              onChange={(value) => setField("subtitleSize", String(value))}
            />
            <SliderField
              label={t("poster.typography.textOffset")}
              value={Number(form.textOffset)}
              min={-TEXT_OFFSET_MAX}
              max={TEXT_OFFSET_MAX}
              step={0.5}
              unit="%"
              defaultValue={Number(DEFAULT_FORM.textOffset)}
              onChange={(value) => setField("textOffset", String(value))}
            />
            <label className="toggle-field">
              <span>{t("poster.typography.divider")}</span>
              <span className="theme-switch">
                <input
                  type="checkbox"
                  name="showDivider"
                  checked={Boolean(form.showDivider)}
                  onChange={onChange}
                />
                <span className="theme-switch-track" aria-hidden="true" />
              </span>
            </label>
            {form.showDivider ? (
              <>
                <SegmentedControl
                  label={t("poster.typography.dividerStyle")}
                  value={form.dividerStyle}
                  options={DIVIDER_STYLES.map((style) => ({
                    value: style,
                    label: t(`poster.typography.dividerStyles.${style}`),
                  }))}
                  onChange={(value) => setField("dividerStyle", value)}
                />
                <SliderField
                  label={t("poster.typography.dividerThickness")}
                  value={Number(form.dividerThickness)}
                  min={DIVIDER_THICKNESS_MIN}
                  max={DIVIDER_THICKNESS_MAX}
                  step={10}
                  unit="%"
                  defaultValue={Number(DEFAULT_FORM.dividerThickness)}
                  onChange={(value) => setField("dividerThickness", String(value))}
                />
              </>
            ) : null}
          </div>
        ) : null}
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
