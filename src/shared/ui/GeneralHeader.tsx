import { InfoIcon } from "@/shared/ui/Icons";
import SocialLinkGroup from "@/shared/ui/SocialLinkGroup";

interface GeneralHeaderProps {
  onAboutOpen: () => void;
}

export default function GeneralHeader({ onAboutOpen }: GeneralHeaderProps) {
  return (
    <header className="general-header">
      <div className="desktop-brand">
        <img
          className="desktop-brand-logo brand-logo"
          src="/assets/logo.svg"
          alt="Terraink logo"
        />
        <div className="desktop-brand-copy brand-copy">
          <h1 className="desktop-brand-title">Terraink</h1>
          <p className="desktop-brand-kicker app-kicker">
            Free Map Poster & Wallpaper Creator
          </p>
        </div>
      </div>

      <div className="general-header-actions">
        <SocialLinkGroup variant="header" />
        <button
          type="button"
          className="general-header-text-btn general-header-about-text-btn"
          onClick={onAboutOpen}
          aria-label="About"
          title="About"
        >
          <span className="general-header-btn-label">About</span>
          <span className="general-header-btn-icon" aria-hidden="true">
            <InfoIcon />
          </span>
        </button>
      </div>
    </header>
  );
}
