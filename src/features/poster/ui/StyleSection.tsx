import { useTranslation } from "react-i18next";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import { openPanelTab } from "@/shared/ui/openPanelTab";
import {
  BORDER_DASHES,
  BORDER_LINES,
  BORDER_THICKNESS_MAX,
  BORDER_THICKNESS_MIN,
  BORDER_WIDTH_MAX,
  BORDER_WIDTH_MIN,
} from "@/features/poster/domain/posterStyleTemplates";
import SliderField from "@/shared/ui/SliderField";
import SegmentedControl from "@/shared/ui/SegmentedControl";
import { DEFAULT_FORM, usePosterContext } from "./PosterContext";
import { ResetIcon } from "@/shared/ui/Icons";

/** Settings the Style reset puts back to default. */
const STYLE_KEYS = [
  "showBorder",
  "borderWidth",
  "borderLine",
  "borderDash",
  "borderThickness",
  "showMarkers",
] as const;

interface StyleSectionProps {
  form: PosterForm;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

/** Poster look: border and overlay. */
export default function StyleSection({ form, onChange }: StyleSectionProps) {
  const { t } = useTranslation();
  const { dispatch } = usePosterContext();
  const setField = (name: string, value: string) =>
    dispatch({ type: "SET_FIELD", name, value });

  return (
    <section className="panel-block">
      <div className="section-summary-head">
        <p className="section-summary-label">{t("poster.typography.style")}</p>
        <button
          type="button"
          className="section-reset-btn"
          title={t("poster.typography.resetStyle")}
          aria-label={t("poster.typography.resetStyle")}
          onClick={() =>
            dispatch({
              type: "SET_FORM_FIELDS",
              fields: Object.fromEntries(
                STYLE_KEYS.map((key) => [key, DEFAULT_FORM[key]]),
              ),
            })
          }
        >
          <ResetIcon aria-hidden="true" />
        </button>
      </div>
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
          <button
            type="button"
            className="subsettings-link"
            onClick={() => openPanelTab("theme")}
          >
            {t("poster.typography.borderColors")} →
          </button>
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
    </section>
  );
}
