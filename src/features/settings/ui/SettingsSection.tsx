import { useMemo, useState } from "react";
import {
  DEFAULT_FORM,
  usePosterContext,
} from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { themeOptions } from "@/features/theme/infrastructure/themeRepository";
import { layoutOptions } from "@/features/layout/infrastructure/layoutRepository";
import { FONT_OPTIONS } from "@/core/config";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import i18n, { changeLanguage } from "@/core/i18n";
import { Trans, useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/core/i18n/languages";
import { useStartupWindowPref } from "@/features/location/application/useStartupWindowPref";

function findFontLabel(fontFamily: string | undefined): string {
  if (!fontFamily) return i18n.t("settings.section.defaultFont");
  const match = FONT_OPTIONS.find((f) => f.value === fontFamily);
  return match?.label ?? fontFamily;
}

export default function SettingsSection() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { state } = usePosterContext();
  const { handleSaveCurrentAsDefaults, handleResetUserDefaults } =
    useFormHandlers();

  const [confirmOpen, setConfirmOpen] = useState<"save" | "reset" | null>(null);
  const { hidden: startupWindowHidden, setHidden: setStartupWindowHidden } =
    useStartupWindowPref();

  const { userDefaults, savedThemes, form } = state;

  // Effective defaults: user-set values fall back to built-in DEFAULT_FORM.
  const effectiveThemeId = userDefaults.theme ?? DEFAULT_FORM.theme;
  const effectiveLayoutId = userDefaults.layout ?? DEFAULT_FORM.layout;
  const effectiveFontFamily =
    userDefaults.fontFamily !== undefined
      ? userDefaults.fontFamily
      : DEFAULT_FORM.fontFamily;

  const themeLabel = useMemo(() => {
    const builtin = themeOptions.find((t) => t.id === effectiveThemeId);
    if (builtin) return builtin.name;
    const saved = savedThemes.find((t) => t.id === effectiveThemeId);
    if (saved) return t("settings.section.savedThemeLabel", { name: saved.name });
    return effectiveThemeId;
  }, [savedThemes, effectiveThemeId]);

  const layoutLabel = useMemo(() => {
    const match = layoutOptions.find((l) => l.id === effectiveLayoutId);
    return match?.name ?? effectiveLayoutId;
  }, [effectiveLayoutId]);

  const fontLabel = findFontLabel(effectiveFontFamily);

  const hasAnyDefaults = Object.keys(userDefaults).length > 0;

  const currentSummary: { label: string; value: string }[] = [
    {
      label: t("settings.section.summaryTheme"),
      value:
        themeOptions.find((t) => t.id === form.theme)?.name ??
        savedThemes.find((t) => t.id === form.theme)?.name ??
        form.theme,
    },
    {
      label: t("settings.section.summaryLayout"),
      value:
        layoutOptions.find((l) => l.id === form.layout)?.name ?? form.layout,
    },
    { label: t("settings.section.summaryFont"), value: findFontLabel(form.fontFamily) },
  ];

  function handleSaveClick() {
    setConfirmOpen("save");
  }

  function handleResetClick() {
    setConfirmOpen("reset");
  }

  function handleConfirm() {
    if (confirmOpen === "save") {
      handleSaveCurrentAsDefaults();
    } else if (confirmOpen === "reset") {
      handleResetUserDefaults();
    }
    setConfirmOpen(null);
  }

  return (
    <section className="panel-block settings-section">
      <h2>{t("settings.section.title")}</h2>
      <p className="settings-note">
        <Trans
          i18nKey="settings.section.note"
          components={{ strong: <strong /> }}
        />
      </p>

      <div className="settings-defaults-list">
        <label className="settings-default-row">
          <span className="settings-default-label">
            {t("settings.section.language")}
          </span>
          <select
            className="settings-language-select"
            value={i18nInstance.language ?? "en"}
            onChange={(e) => void changeLanguage(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-default-row settings-toggle-row">
          <span className="settings-toggle-text">
            <span className="settings-default-label">
              {t("settings.section.startupWindow")}
            </span>
            <span className="settings-toggle-hint">
              {t("settings.section.startupWindowHint")}
            </span>
          </span>
          <span className="theme-switch">
            <input
              type="checkbox"
              checked={!startupWindowHidden}
              onChange={(event) => setStartupWindowHidden(!event.target.checked)}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>
        <div className="settings-default-row">
          <span className="settings-default-label">{t("settings.section.defaultTheme")}</span>
          <span className="settings-default-value">{themeLabel}</span>
        </div>
        <div className="settings-default-row">
          <span className="settings-default-label">{t("settings.section.defaultLayout")}</span>
          <span className="settings-default-value">{layoutLabel}</span>
        </div>
        <div className="settings-default-row">
          <span className="settings-default-label">{t("settings.section.defaultFontLabel")}</span>
          <span className="settings-default-value">{fontLabel}</span>
        </div>

        <div className="settings-default-row is-disabled" aria-disabled="true">
          <span className="settings-default-label">{t("settings.section.defaultLocation")}</span>
          <span className="settings-default-value">
            <span className="settings-coming-soon">{t("settings.section.comingSoon")}</span>
          </span>
        </div>
        <div className="settings-default-row is-disabled" aria-disabled="true">
          <span className="settings-default-label">{t("settings.section.defaultDistance")}</span>
          <span className="settings-default-value">
            <span className="settings-coming-soon">{t("settings.section.comingSoon")}</span>
          </span>
        </div>
        <div className="settings-default-row is-disabled" aria-disabled="true">
          <span className="settings-default-label">{t("settings.section.defaultUnit")}</span>
          <span className="settings-default-value">
            {t("settings.section.centimeters")}
            <span className="settings-coming-soon">{t("settings.section.comingSoon")}</span>
          </span>
        </div>
        <div className="settings-default-row is-disabled" aria-disabled="true">
          <span className="settings-default-label">{t("settings.section.appTheme")}</span>
          <span className="settings-default-value">
            {t("settings.section.dark")}
            <span className="settings-coming-soon">{t("settings.section.comingSoon")}</span>
          </span>
        </div>
      </div>

      <div className="settings-actions">
        <button
          type="button"
          className="settings-save-btn"
          onClick={handleSaveClick}
        >
          {t("settings.section.saveButton")}
        </button>
        <button
          type="button"
          className="settings-reset-btn"
          onClick={handleResetClick}
          disabled={!hasAnyDefaults}
        >
          {t("settings.section.resetButton")}
        </button>
      </div>

      {confirmOpen === "save" ? (
        <ConfirmModal
          title={t("settings.section.saveModalTitle")}
          message={
            t("settings.section.saveModalIntro") +
            "\n\n" +
            currentSummary
              .map((s) => `• ${s.label}: ${s.value}`)
              .join("\n") +
            "\n\n" +
            t("settings.section.saveModalOutro")
          }
          confirmLabel={t("settings.section.saveButton")}
          cancelLabel={t("settings.section.cancel")}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(null)}
        />
      ) : null}

      {confirmOpen === "reset" ? (
        <ConfirmModal
          title={t("settings.section.resetModalTitle")}
          message={t("settings.section.resetModalMessage")}
          confirmLabel={t("settings.section.resetButton")}
          cancelLabel={t("settings.section.cancel")}
          destructive
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(null)}
        />
      ) : null}
    </section>
  );
}
