import { useTranslation } from "react-i18next";
import { InfoIcon } from "@/shared/ui/Icons";
import SocialLinkGroup from "@/shared/ui/SocialLinkGroup";
import { useAppTheme } from "@/features/appTheme/application/useAppTheme";

interface GeneralHeaderProps {
  onAboutOpen: () => void;
}

export default function GeneralHeader({ onAboutOpen }: GeneralHeaderProps) {
  const { t } = useTranslation();
  const { logo } = useAppTheme();
  return (
    <header className="general-header">
      <div className="desktop-brand">
        <img
          className="desktop-brand-logo brand-logo"
          src={logo}
          alt={t("shell.header.logoAlt")}
        />
        <div className="desktop-brand-copy brand-copy">
          <h1 className="desktop-brand-title">Terraink</h1>
          <p className="desktop-brand-kicker app-kicker">
            {t("shell.header.tagline")}
          </p>
        </div>
      </div>

      <div className="general-header-actions">
        <SocialLinkGroup variant="header" />
        <button
          type="button"
          className="general-header-text-btn general-header-about-text-btn"
          onClick={onAboutOpen}
          aria-label={t("shell.header.about")}
          title={t("shell.header.about")}
        >
          <span className="general-header-btn-label">{t("shell.header.about")}</span>
          <span className="general-header-btn-icon" aria-hidden="true">
            <InfoIcon />
          </span>
        </button>
      </div>
    </header>
  );
}
