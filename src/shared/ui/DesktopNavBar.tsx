import {
  LocationIcon,
  ThemeIcon,
  LayoutIcon,
  LayersIcon,
  MarkersIcon,
  RouteIcon,
  StyleIcon,
  SettingsIcon,
} from "./Icons";
import type { MobileTab } from "./MobileNavBar";

const tabs: {
  id: MobileTab;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "theme", label: "Theme", Icon: ThemeIcon },
  { id: "layout", label: "Layout", Icon: LayoutIcon },
  { id: "style", label: "Style", Icon: StyleIcon },
  { id: "layers", label: "Layers", Icon: LayersIcon },
  { id: "markers", label: "Markers", Icon: MarkersIcon },
  { id: "routes", label: "Routes", Icon: RouteIcon },
];

interface DesktopNavBarProps {
  activeTab: MobileTab;
  panelOpen: boolean;
  onTabChange: (tab: MobileTab) => void;
  isLocationVisible: boolean;
  onLocationToggle: () => void;
}

export default function DesktopNavBar({
  activeTab,
  panelOpen,
  onTabChange,
  isLocationVisible,
  onLocationToggle,
}: DesktopNavBarProps) {
  return (
    <nav className="desktop-nav-bar" aria-label="Settings sections">
      <button
        type="button"
        className={`desktop-nav-tab${isLocationVisible ? " is-active" : ""}`}
        onClick={onLocationToggle}
        title={isLocationVisible ? "Hide location row" : "Show location row"}
        aria-label={isLocationVisible ? "Hide location row" : "Show location row"}
        aria-pressed={isLocationVisible}
      >
        <LocationIcon className="desktop-nav-icon" />
        <span className="desktop-nav-label">Location</span>
      </button>

      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`desktop-nav-tab${panelOpen && activeTab === id ? " is-active" : ""}`}
          onClick={() => onTabChange(id)}
          title={label}
          aria-label={label}
          aria-current={panelOpen && activeTab === id ? "page" : undefined}
        >
          <Icon className="desktop-nav-icon" />
          <span className="desktop-nav-label">{label}</span>
        </button>
      ))}

      <button
        type="button"
        className="desktop-nav-tab desktop-nav-tab--settings"
        aria-label="Settings"
        disabled
      >
        <SettingsIcon className="desktop-nav-icon" />
        <span className="desktop-nav-label">Settings</span>
      </button>
    </nav>
  );
}
