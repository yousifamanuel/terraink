import { useTranslation } from "react-i18next";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import { resolvePosterNames } from "@/features/poster/domain/posterNames";
import type { FontOption } from "@/core/config";
import { COORDINATE_FORMATS, formatCoordinates } from "@/shared/geo/posterBounds";
import CoordinateSeparatorPicker from "./CoordinateSeparatorPicker";
import FontPicker from "./FontPicker";
import {
  PLACEHOLDER_EXAMPLE_CITY,
  PLACEHOLDER_EXAMPLE_COUNTRY,
} from "@/features/location/ui/constants";
import {
  DIVIDER_STYLES,
  POSTER_TEXT_ALIGNS,
  POSTER_TEXT_POSITIONS,
  DIVIDER_THICKNESS_MAX,
  DIVIDER_THICKNESS_MIN,
  TEXT_OFFSET_MAX,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
} from "@/features/poster/domain/posterStyleTemplates";
import SliderField from "@/shared/ui/SliderField";
import SegmentedControl from "@/shared/ui/SegmentedControl";
import { DEFAULT_FORM, usePosterContext } from "./PosterContext";
import { ResetIcon } from "@/shared/ui/Icons";

interface TextSectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  fontOptions: FontOption[];
}

/** Poster text: position, alignment, title and subtitle, sizes, divider, font, coordinates. */
export default function TextSection({
  form,
  onChange,
  fontOptions,
}: TextSectionProps) {
  const { t } = useTranslation();
  const { state, dispatch, effectiveTheme } = usePosterContext();
  // The fields show what the poster prints, which follows the zoom until
  // the user types their own text.
  const posterNames = resolvePosterNames({
    city: form.displayCity,
    country: form.displayCountry,
    continent: form.displayContinent,
    location: form.location,
    customTitle: form.posterTitle,
    customSubtitle: form.posterSubtitle,
    overrides: state.displayNameOverrides,
    zoom: state.mapZoom,
  });
  const setField = (name: string, value: string) =>
    dispatch({ type: "SET_FIELD", name, value });
  /** Every Text setting back to default; typed title/subtitle are cleared, so the place names return. */
  const textDefaults = () => {
    const keys = [
      "textPosition",
      "textAlign",
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
  const exampleLat = Number(form.latitude) || 0;
  const exampleLon = Number(form.longitude) || 0;


  return (
    <>
      <section className="panel-block">
        <div className="section-summary-head">
          <p className="section-summary-label">{t("poster.typography.text")}</p>
          <button
            type="button"
            className="section-reset-btn"
            title={t("poster.typography.resetText")}
            aria-label={t("poster.typography.resetText")}
            onClick={() =>
              dispatch({
                type: "SET_FORM_FIELDS",
                resetDisplayNameOverrides: true,
                fields: { ...textDefaults(), posterTitle: "", posterSubtitle: "" },
              })
            }
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
                name="posterTitle"
                value={posterNames.title}
                onChange={onChange}
                placeholder={PLACEHOLDER_EXAMPLE_CITY}
              />
            </label>
            <label>
              {t("poster.typography.displayCountry")}
              <input
                className="form-control-tall"
                name="posterSubtitle"
                value={posterNames.subtitle}
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
              label={t(
                form.textPosition === "top"
                  ? "poster.typography.textOffsetDown"
                  : "poster.typography.textOffsetUp",
              )}
              value={Number(form.textOffset)}
              min={0}
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
        <div className="font-picker-field">
          <span className="font-picker-label">{t("poster.typography.font")}</span>
          <FontPicker
            value={form.fontFamily}
            options={fontOptions}
            onSelect={(family) => setField("fontFamily", family)}
            backgroundColor={effectiveTheme.ui.bg}
            textColor={effectiveTheme.ui.text}
          />
        </div>
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
