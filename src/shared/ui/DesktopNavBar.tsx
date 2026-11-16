import { useTranslation } from "react-i18next";
import {
  LocationIcon,
  ThemeIcon,
  LayoutIcon,
  LayersIcon,
  MarkersIcon,
  RouteIcon,
  StyleIcon,
  TextIcon,
  ColorIcon,
  NewsIcon,
  SettingsIcon,
} from "./Icons";
import type { MobileTab } from "./MobileNavBar";

const tabs: {
  id: MobileTab;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "theme", labelKey: "shell.nav.theme", Icon: ThemeIcon },
  { id: "layout", labelKey: "shell.nav.layout", Icon: LayoutIcon },
  { id: "text", labelKey: "shell.nav.text", Icon: TextIcon },
  { id: "style", labelKey: "shell.nav.style", Icon: StyleIcon },
  { id: "color", labelKey: "shell.nav.color", Icon: ColorIcon },
  { id: "layers", labelKey: "shell.nav.layers", Icon: LayersIcon },
  { id: "markers", labelKey: "shell.nav.markers", Icon: MarkersIcon },
  { id: "routes", labelKey: "shell.nav.routes", Icon: RouteIcon },
];

interface DesktopNavBarProps {
  activeTab: MobileTab;
  panelOpen: boolean;
  onTabChange: (tab: MobileTab) => void;
  isLocationVisible: boolean;
  onLocationToggle: () => void;
  /** The dot marks release notes not yet opened. */
  hasUnreadNews: boolean;
  onNewsOpen: () => void;
}

export default function DesktopNavBar({
  activeTab,
  panelOpen,
  onTabChange,
  isLocationVisible,
  onLocationToggle,
  hasUnreadNews,
  onNewsOpen,
}: DesktopNavBarProps) {
  const { t } = useTranslation();
  const locationToggleLabel = isLocationVisible
    ? t("shell.nav.hideLocation")
    : t("shell.nav.showLocation");
  return (
    <nav className="desktop-nav-bar" aria-label={t("shell.nav.sections")}>
      <button
        type="button"
        className={`desktop-nav-tab${isLocationVisible ? " is-active" : ""}`}
        onClick={onLocationToggle}
        title={locationToggleLabel}
        aria-label={locationToggleLabel}
        aria-pressed={isLocationVisible}
      >
        <LocationIcon className="desktop-nav-icon" />
        <span className="desktop-nav-label">{t("shell.nav.location")}</span>
      </button>

      {tabs.map(({ id, labelKey, Icon }) => (
        <button
          key={id}
          type="button"
          className={`desktop-nav-tab${panelOpen && activeTab === id ? " is-active" : ""}`}
          onClick={() => onTabChange(id)}
          title={t(labelKey)}
          aria-label={t(labelKey)}
          aria-current={panelOpen && activeTab === id ? "page" : undefined}
        >
          <Icon className="desktop-nav-icon" />
          <span className="desktop-nav-label">{t(labelKey)}</span>
        </button>
      ))}

      <button
          type="button"
          className="desktop-nav-tab desktop-nav-tab--news"
          title={t("shell.nav.news")}
          aria-label={t("shell.nav.news")}
          onClick={onNewsOpen}
        >
          <span className="news-icon-wrap">
            <NewsIcon className="desktop-nav-icon" />
            {hasUnreadNews ? <span className="news-dot" aria-hidden="true" /> : null}
          </span>
          <span className="desktop-nav-label">{t("shell.nav.news")}</span>
        </button>

      <button
        type="button"
        className={`desktop-nav-tab desktop-nav-tab--settings${
          panelOpen && activeTab === "settings" ? " is-active" : ""
        }`}
        title={t("shell.nav.settings")}
        aria-label={t("shell.nav.settings")}
        aria-current={
          panelOpen && activeTab === "settings" ? "page" : undefined
        }
        onClick={() => onTabChange("settings")}
      >
        <SettingsIcon className="desktop-nav-icon" />
        <span className="desktop-nav-label">{t("shell.nav.settings")}</span>
      </button>
    </nav>
  );
}
