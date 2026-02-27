import ThemeCard from "./ThemeCard";
import { EditIcon } from "@/shared/ui/Icons";
import type { ThemeOption } from "../domain/types";

interface ThemeSummarySectionProps {
  themeName: string;
  themeOption: ThemeOption;
  onCustomize: () => void;
  onOpenThemePicker: () => void;
}

export default function ThemeSummarySection({
  themeName,
  themeOption,
  onCustomize,
  onOpenThemePicker,
}: ThemeSummarySectionProps) {
  return (
    <div className="theme-section">
      <div className="theme-summary-view">
        <div className="theme-summary-header">
          <p className="theme-active-label">Theme: {themeName}</p>
          <button
            type="button"
            className="theme-customize-btn"
            onClick={onCustomize}
            aria-label="Customize theme colors"
          >
            <span className="theme-customize-icon" aria-hidden="true">
              <EditIcon />
            </span>
            Customize
          </button>
        </div>
        <ThemeCard
          themeOption={themeOption}
          showName={false}
          onClick={onOpenThemePicker}
        />
      </div>
    </div>
  );
}
