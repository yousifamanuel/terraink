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
import NavTab from "./NavTab";

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
  /** New features per tab (tab id → count), shown as a dot with the number. */
  tabDots?: Record<string, number>;
}

export default function DesktopNavBar({
  activeTab,
  panelOpen,
  onTabChange,
  isLocationVisible,
  onLocationToggle,
  hasUnreadNews,
  onNewsOpen,
  tabDots = {},
}: DesktopNavBarProps) {
  const { t } = useTranslation();
  const locationToggleLabel = isLocationVisible
    ? t("shell.nav.hideLocation")
    : t("shell.nav.showLocation");
  return (
    <nav className="desktop-nav-bar" aria-label={t("shell.nav.sections")}>
      <NavTab
        variant="desktop"
        label={t("shell.nav.location")}
        actionLabel={locationToggleLabel}
        Icon={LocationIcon}
        isActive={isLocationVisible}
        ariaPressed={isLocationVisible}
        dot={tabDots.location}
        onClick={onLocationToggle}
      />

      {tabs.map(({ id, labelKey, Icon }) => {
        const isActive = panelOpen && activeTab === id;
        return (
          <NavTab
            key={id}
            variant="desktop"
            label={t(labelKey)}
            Icon={Icon}
            isActive={isActive}
            ariaCurrent={isActive ? "page" : undefined}
            dot={tabDots[id]}
            onClick={() => onTabChange(id)}
          />
        );
      })}

      <NavTab
        variant="desktop"
        className="desktop-nav-tab--news"
        label={t("shell.nav.news")}
        Icon={NewsIcon}
        dot={hasUnreadNews}
        onClick={onNewsOpen}
      />

      <NavTab
        variant="desktop"
        className="desktop-nav-tab--settings"
        label={t("shell.nav.settings")}
        Icon={SettingsIcon}
        isActive={panelOpen && activeTab === "settings"}
        ariaCurrent={panelOpen && activeTab === "settings" ? "page" : undefined}
        dot={tabDots.settings}
        onClick={() => onTabChange("settings")}
      />
    </nav>
  );
}
