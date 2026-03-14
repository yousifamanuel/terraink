import {
  LocationIcon,
  ThemeIcon,
  LayoutIcon,
  StyleIcon,
  ExportIcon,
} from "./Icons";

export type MobileTab = "location" | "theme" | "layout" | "style" | "export";

const tabs: { id: MobileTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "location", label: "Location", Icon: LocationIcon },
  { id: "theme",    label: "Theme",    Icon: ThemeIcon    },
  { id: "layout",   label: "Layout",   Icon: LayoutIcon   },
  { id: "style",    label: "Style",    Icon: StyleIcon    },
  { id: "export",   label: "Export",   Icon: ExportIcon   },
];

interface MobileNavBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export default function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`mobile-nav-tab${activeTab === id ? " is-active" : ""}`}
          onClick={() => onTabChange(id)}
          aria-current={activeTab === id ? "page" : undefined}
        >
          <Icon className="mobile-nav-icon" />
          <span className="mobile-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
