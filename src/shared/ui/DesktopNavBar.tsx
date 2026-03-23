import { useLocale } from "@/core/i18n/LocaleContext";
import {
  LocationIcon,
  ThemeIcon,
  LayoutIcon,
  LayersIcon,
  MarkersIcon,
  StyleIcon,
  SettingsIcon,
} from "./Icons";
import type { MobileTab } from "./MobileNavBar";

const tabs: MobileTab[] = ["theme", "layout", "style", "layers", "markers"];

const tabIconMap: Record<
  MobileTab,
  React.ComponentType<{ className?: string }>
> = {
  location: LocationIcon,
  theme: ThemeIcon,
  layout: LayoutIcon,
  style: StyleIcon,
  layers: LayersIcon,
  markers: MarkersIcon,
};

interface DesktopNavBarProps {
  activeTab: MobileTab;
  panelOpen: boolean;
  onTabChange: (tab: MobileTab) => void;
  isLocationVisible: boolean;
  onLocationToggle: () => void;
  onSettingsToggle: () => void;
}

export default function DesktopNavBar({
  activeTab,
  panelOpen,
  onTabChange,
  isLocationVisible,
  onLocationToggle,
  onSettingsToggle,
}: DesktopNavBarProps) {
  const { t } = useLocale();

  return (
    <nav className="desktop-nav-bar" aria-label={t("nav.desktopLabel")}>
      <button
        type="button"
        className={`desktop-nav-tab${isLocationVisible ? " is-active" : ""}`}
        onClick={onLocationToggle}
        title={isLocationVisible ? t("nav.location.hide") : t("nav.location.show")}
        aria-label={isLocationVisible ? t("nav.location.hide") : t("nav.location.show")}
        aria-pressed={isLocationVisible}
      >
        <LocationIcon className="desktop-nav-icon" />
        <span className="desktop-nav-label">{t("nav.location")}</span>
      </button>

      {tabs.map((id) => {
        const Icon = tabIconMap[id];

        return (
          <button
            key={id}
            type="button"
            className={`desktop-nav-tab${panelOpen && activeTab === id ? " is-active" : ""}`}
            onClick={() => onTabChange(id)}
            title={t(`nav.${id}`)}
            aria-label={t(`nav.${id}`)}
            aria-current={panelOpen && activeTab === id ? "page" : undefined}
          >
            <Icon className="desktop-nav-icon" />
            <span className="desktop-nav-label">{t(`nav.${id}`)}</span>
          </button>
        );
      })}

      <button
        type="button"
        className={`desktop-nav-tab desktop-nav-tab--settings${panelOpen ? " is-active" : ""}`}
        aria-label={t("nav.settings")}
        aria-pressed={panelOpen}
        onClick={onSettingsToggle}
      >
        <SettingsIcon className="desktop-nav-icon" />
        <span className="desktop-nav-label">{t("nav.settings")}</span>
      </button>
    </nav>
  );
}
