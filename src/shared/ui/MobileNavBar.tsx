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
  SettingsIcon,
} from "./Icons";
import NavTab from "./NavTab";

export type MobileTab =
  | "location"
  | "theme"
  | "color"
  | "layout"
  | "text"
  | "style"
  | "layers"
  | "markers"
  | "routes"
  | "settings";

const tabs: {
  id: MobileTab;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "location", labelKey: "shell.nav.location", Icon: LocationIcon },
  { id: "theme", labelKey: "shell.nav.theme", Icon: ThemeIcon },
  { id: "layout", labelKey: "shell.nav.layout", Icon: LayoutIcon },
  { id: "text", labelKey: "shell.nav.text", Icon: TextIcon },
  { id: "style", labelKey: "shell.nav.style", Icon: StyleIcon },
  { id: "color", labelKey: "shell.nav.color", Icon: ColorIcon },
  { id: "layers", labelKey: "shell.nav.layers", Icon: LayersIcon },
  { id: "markers", labelKey: "shell.nav.markers", Icon: MarkersIcon },
  { id: "routes", labelKey: "shell.nav.routes", Icon: RouteIcon },
];

interface MobileNavBarProps {
  activeTab: MobileTab;
  drawerOpen: boolean;
  isLocationVisible: boolean;
  onTabChange: (tab: MobileTab) => void;
  /** New features per tab (tab id → count), shown as a dot with the number. */
  tabDots?: Record<string, number>;
}

export default function MobileNavBar({
  activeTab,
  drawerOpen,
  isLocationVisible,
  onTabChange,
  tabDots = {},
}: MobileNavBarProps) {
  const { t } = useTranslation();
  return (
    <div className="mobile-nav-wrapper">
      <nav className="mobile-nav" aria-label={t("shell.nav.mobileNav")}>
        <div className="mobile-nav-scroll-container">
          <div className="mobile-nav-tabs">
            {tabs.map(({ id, labelKey, Icon }) => {
              const isLocationTab = id === "location";
              const isActive = isLocationTab
                ? isLocationVisible
                : drawerOpen && activeTab === id;
              return (
                <NavTab
                  key={id}
                  variant="mobile"
                  label={t(labelKey)}
                  Icon={Icon}
                  isActive={isActive}
                  ariaCurrent={!isLocationTab && activeTab === id ? "page" : undefined}
                  ariaPressed={isLocationTab ? isLocationVisible : undefined}
                  dot={tabDots[id]}
                  onClick={() => onTabChange(id)}
                />
              );
            })}
          </div>
          <div className="mobile-nav-fade" aria-hidden="true" />
        </div>
      </nav>

      <button
        type="button"
        className={`mobile-nav-settings${
          drawerOpen && activeTab === "settings" ? " is-active" : ""
        }`}
        aria-label={t("shell.nav.settings")}
        aria-pressed={drawerOpen && activeTab === "settings"}
        onClick={() => onTabChange("settings")}
      >
        <SettingsIcon className="mobile-nav-settings-icon" />
      </button>
    </div>
  );
}
