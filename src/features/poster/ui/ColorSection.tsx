import { useTranslation } from "react-i18next";
import {
  adjustColor,
  COLOR_ADJUST_LIMITS,
  hasColorAdjustments,
  type ColorAdjustments,
} from "@/features/theme/domain/colorAdjust";
import { getThemeDescription } from "@/features/theme/application/themeDescription";
import SaveThemeButton from "@/features/theme/ui/SaveThemeButton";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { COLOR_ADJUST_DEFAULTS } from "@/features/poster/application/colorAdjustFields";
import { applyThemeColorOverrides } from "@/features/theme/domain/colorPaths";
import SliderField from "@/shared/ui/SliderField";
import { ResetIcon } from "@/shared/ui/Icons";
import NewLabel from "@/features/hints/ui/NewLabel";
import { usePosterContext } from "./PosterContext";

const NO_CHANGE: ColorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  warmth: 0,
  invert: false,
  grayscale: false,
};

const SLIDERS = [
  { name: "colorBrightness", key: "brightness", unit: "%" },
  { name: "colorContrast", key: "contrast", unit: "%" },
  { name: "colorSaturation", key: "saturation", unit: "%" },
  { name: "colorHue", key: "hue", unit: "°" },
  { name: "colorWarmth", key: "warmth", unit: "" },
] as const;

const SWITCHES = [
  { name: "colorInvert", key: "invert" },
  { name: "colorGrayscale", key: "grayscale" },
] as const;

/**
 * Color tab: adjust every theme color at once. The slider tracks show the
 * effect, and a strip compares the main colors before and after.
 */
export default function ColorSection() {
  const { t } = useTranslation();
  const { state, dispatch, selectedTheme, effectiveTheme } = usePosterContext();
  const { form } = state;
  const {
    handleAddSavedTheme,
    handleUpdateSavedTheme,
    handleThemeChange,
    handleResetColors,
  } = useFormHandlers();
  const hasChanges = hasColorAdjustments({
    brightness: Number(form.colorBrightness) || 0,
    contrast: Number(form.colorContrast) || 0,
    saturation: Number(form.colorSaturation) || 0,
    hue: Number(form.colorHue) || 0,
    warmth: Number(form.colorWarmth) || 0,
    invert: Boolean(form.colorInvert),
    grayscale: Boolean(form.colorGrayscale),
  });

  const before = applyThemeColorOverrides(selectedTheme, state.customColors);
  const mainColors = (theme: typeof before) => [
    theme.ui.bg,
    theme.map.water,
    theme.map.parks,
    theme.map.roads.minor_high,
    theme.map.roads.major,
    theme.ui.text,
  ];

  // Track gradients: what the slider does to the theme's text color.
  const base = before.ui.text;
  const sweep = (key: "hue" | "warmth" | "saturation" | "brightness" | "contrast", limit: number) =>
    `linear-gradient(to right, ${[-1, -0.5, 0, 0.5, 1]
      .map((step) => adjustColor(base, { ...NO_CHANGE, [key]: step * limit }))
      .join(", ")})`;
  const tracks: Record<(typeof SLIDERS)[number]["key"], string> = {
    brightness: "linear-gradient(to right, #050505, #8a8a8a, #fafafa)",
    // Upper half grey → white, lower half grey → black: flat on the left,
    // strong light/dark difference on the right.
    contrast:
      "linear-gradient(to right, #7c7c7c, #ffffff) top / 100% 50% no-repeat, " +
      "linear-gradient(to right, #7c7c7c, #000000) bottom / 100% 50% no-repeat",
    saturation: sweep("saturation", COLOR_ADJUST_LIMITS.saturation),
    hue: sweep("hue", COLOR_ADJUST_LIMITS.hue),
    warmth: "linear-gradient(to right, #4f8fe6, #c9c9c9, #f2a43a)",
  };

  return (
    <section className="panel-block">
      <div className="section-summary-head">
        <p className="section-summary-label">
          {t("poster.color.title")}
          <NewLabel feature="color-tab" />
        </p>
        {/* Same Save as in the theme editor; enabled once something changed. */}
        <div className="color-section-actions">
          <SaveThemeButton
            disabled={!hasChanges}
            themeName={selectedTheme.name}
            themeDescription={getThemeDescription({
              id: form.theme,
              description: selectedTheme.description,
            })}
            colors={effectiveTheme}
            currentThemeId={form.theme}
            savedThemes={state.savedThemes}
            onAddSavedTheme={handleAddSavedTheme}
            onUpdateSavedTheme={handleUpdateSavedTheme}
            onThemeChange={handleThemeChange}
            onSaved={() => {
              handleResetColors();
              dispatch({ type: "SET_FORM_FIELDS", fields: COLOR_ADJUST_DEFAULTS });
            }}
          />
          <button
            type="button"
            className="section-reset-btn"
            title={t("poster.color.reset")}
            aria-label={t("poster.color.reset")}
            onClick={() => dispatch({ type: "SET_FORM_FIELDS", fields: COLOR_ADJUST_DEFAULTS })}
          >
            <ResetIcon aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="settings-toggle-hint color-section-hint">{t("poster.color.hint")}</p>

      <div className="color-preview" aria-hidden="true">
        <span className="color-preview-label">{t("poster.color.before")}</span>
        <span className="color-preview-row">
          {mainColors(before).map((color, index) => (
            <span key={index} style={{ backgroundColor: color }} />
          ))}
        </span>
        <span className="color-preview-label">{t("poster.color.after")}</span>
        <span className="color-preview-row">
          {mainColors(effectiveTheme).map((color, index) => (
            <span key={index} style={{ backgroundColor: color }} />
          ))}
        </span>
      </div>

      <label className="toggle-field">
        <span>{t("poster.color.keepAcrossThemes")}</span>
        <span className="theme-switch">
          <input
            type="checkbox"
            checked={Boolean(form.colorKeepAcrossThemes)}
            onChange={(event) =>
              dispatch({
                type: "SET_FIELD",
                name: "colorKeepAcrossThemes",
                value: event.target.checked,
              })
            }
          />
          <span className="theme-switch-track" aria-hidden="true" />
        </span>
      </label>

      {SLIDERS.map((slider) => (
        <SliderField
          key={slider.name}
          label={t(`poster.color.${slider.key}`)}
          value={Number(form[slider.name]) || 0}
          min={-COLOR_ADJUST_LIMITS[slider.key]}
          max={COLOR_ADJUST_LIMITS[slider.key]}
          step={1}
          unit={slider.unit}
          defaultValue={0}
          trackBackground={tracks[slider.key]}
          commitDelayMs={150}
          onChange={(value) =>
            dispatch({ type: "SET_FIELD", name: slider.name, value: String(value) })
          }
        />
      ))}

      {SWITCHES.map((toggle) => (
        <label key={toggle.name} className="toggle-field">
          <span>{t(`poster.color.${toggle.key}`)}</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              checked={Boolean(form[toggle.name])}
              onChange={(event) =>
                dispatch({ type: "SET_FIELD", name: toggle.name, value: event.target.checked })
              }
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>
      ))}
    </section>
  );
}
