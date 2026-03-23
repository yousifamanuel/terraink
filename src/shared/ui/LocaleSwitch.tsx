import { useLocale } from "@/core/i18n/LocaleContext";

export default function LocaleSwitch() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="locale-switch" role="group" aria-label={t("header.localeLabel")}>
      <button
        type="button"
        className={`general-header-text-btn locale-switch__button${locale === "en" ? " is-active" : ""}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label={t("header.localeEnglish")}
        title={t("header.localeEnglish")}
      >
        <span className="general-header-btn-label">{t("header.localeEnglish")}</span>
      </button>
      <button
        type="button"
        className={`general-header-text-btn locale-switch__button${locale === "zh-CN" ? " is-active" : ""}`}
        onClick={() => setLocale("zh-CN")}
        aria-pressed={locale === "zh-CN"}
        aria-label={t("header.localeChinese")}
        title={t("header.localeChinese")}
      >
        <span className="general-header-btn-label">{t("header.localeChinese")}</span>
      </button>
    </div>
  );
}
