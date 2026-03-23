import { useLocale } from "@/core/i18n/LocaleContext";
import { InfoIcon } from "@/shared/ui/Icons";
import LocaleSwitch from "@/shared/ui/LocaleSwitch";
import SocialLinkGroup from "@/shared/ui/SocialLinkGroup";

interface GeneralHeaderProps {
  onAboutOpen: () => void;
}

export default function GeneralHeader({ onAboutOpen }: GeneralHeaderProps) {
  const { t } = useLocale();

  return (
    <header className="general-header">
      <div className="desktop-brand">
        <img
          className="desktop-brand-logo brand-logo"
          src="/assets/logo.svg"
          alt="TerraInk logo"
        />
        <div className="desktop-brand-copy brand-copy">
          <h1 className="desktop-brand-title">TerraInk</h1>
          <p className="desktop-brand-kicker app-kicker">
            {t("header.brandKicker")}
          </p>
        </div>
      </div>

      <div className="general-header-actions">
        <SocialLinkGroup variant="header" />
        <LocaleSwitch />
        <button
          type="button"
          className="general-header-text-btn general-header-about-text-btn"
          onClick={onAboutOpen}
          aria-label={t("nav.about")}
          title={t("nav.about")}
        >
          <span className="general-header-btn-label">{t("nav.about")}</span>
          <span className="general-header-btn-icon" aria-hidden="true">
            <InfoIcon />
          </span>
        </button>
      </div>
    </header>
  );
}
