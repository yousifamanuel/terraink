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

export type MobileTab =
  | "location"
  | "theme"
  | "layout"
  | "style"
  | "layers"
  | "markers";

const tabs: MobileTab[] = ["location", "theme", "layout", "style", "layers", "markers"];

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

interface MobileNavBarProps {
  activeTab: MobileTab;
  drawerOpen: boolean;
  isLocationVisible: boolean;
  onTabChange: (tab: MobileTab) => void;
  onSettingsToggle: () => void;
}

export default function MobileNavBar({
  activeTab,
  drawerOpen,
  isLocationVisible,
  onTabChange,
  onSettingsToggle,
}: MobileNavBarProps) {
  const { t } = useLocale();

  return (
    <div className="mobile-nav-wrapper">
      <nav className="mobile-nav" aria-label={t("nav.mobileLabel")}>
        <div className="mobile-nav-scroll-container">
          <div className="mobile-nav-tabs">
            {tabs.map((id) => {
              const Icon = tabIconMap[id];
              const isLocationTab = id === "location";
              const isActive = isLocationTab
                ? isLocationVisible
                : drawerOpen && activeTab === id;

              return (
                <button
                  key={id}
                  type="button"
                  className={`mobile-nav-tab${isActive ? " is-active" : ""}`}
                  onClick={() => onTabChange(id)}
                  title={t(`nav.${id}`)}
                  aria-label={t(`nav.${id}`)}
                  aria-current={!isLocationTab && activeTab === id ? "page" : undefined}
                  aria-pressed={isLocationTab ? isLocationVisible : undefined}
                >
                  <Icon className="mobile-nav-icon" />
                  <span className="mobile-nav-label">{t(`nav.${id}`)}</span>
                </button>
              );
            })}
          </div>
          <div className="mobile-nav-fade" aria-hidden="true" />
        </div>
      </nav>

      <button
        type="button"
        className="mobile-nav-settings"
        aria-label={t("nav.settings")}
        aria-pressed={drawerOpen}
        onClick={onSettingsToggle}
      >
        <SettingsIcon className="mobile-nav-settings-icon" />
      </button>
    </div>
  );
}
