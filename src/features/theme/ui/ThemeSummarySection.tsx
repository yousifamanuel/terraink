import type { RefObject } from "react";
import ThemeCard from "./ThemeCard";
import { EditIcon } from "@/shared/ui/Icons";
import type { ThemeOption } from "../domain/types";
import AdUnit from "@/shared/ui/AdUnit";
import { AD_SLOT_INFEED } from "@/core/config";

const AD_AFTER_NTH_CARD = 4;

interface ThemeSummarySectionProps {
  listRef?: RefObject<HTMLDivElement>;
  themeOptions: ThemeOption[];
  selectedThemeId: string;
  selectedThemeOption: ThemeOption;
  onThemeSelect: (themeId: string) => void;
  onCustomize: () => void;
}

export default function ThemeSummarySection({
  listRef,
  themeOptions,
  selectedThemeId,
  selectedThemeOption,
  onThemeSelect,
  onCustomize,
}: ThemeSummarySectionProps) {
  const description =
    selectedThemeOption.description?.trim() || "No description available.";

  return (
    <div className="theme-summary-view">
      <div className="theme-summary-head">
        <div className="theme-summary-copy">
          <p className="theme-summary-label">
            Theme: <span className="theme-summary-label-name">{selectedThemeOption.name}</span>
          </p>
          <p className="theme-card-description">{description}</p>
        </div>
        <button
          type="button"
          className="theme-customize-btn"
          onClick={onCustomize}
          aria-label={`Customize ${selectedThemeOption.name} colors`}
        >
          <span className="theme-customize-icon" aria-hidden="true">
            <EditIcon />
          </span>
        </button>
      </div>

      <div
        className="theme-card-list card-scroll-list"
        role="list"
        aria-label="Theme options"
        ref={listRef}
      >
        {themeOptions.flatMap((themeOption, i) => {
          const card = (
            <ThemeCard
              key={themeOption.id}
              themeOption={themeOption}
              isSelected={themeOption.id === selectedThemeId}
              onClick={() => onThemeSelect(themeOption.id)}
            />
          );
          if ((i + 1) % AD_AFTER_NTH_CARD === 0) {
            return [
              card,
              <AdUnit key={`ad-theme-${i}`} slot={AD_SLOT_INFEED} format="rectangle" />,
            ];
          }
          return [card];
        })}
      </div>
    </div>
  );
}
