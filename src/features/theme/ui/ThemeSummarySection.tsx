import type { RefObject } from "react";
import ThemeCard from "./ThemeCard";
import { EditIcon } from "@/shared/ui/Icons";
import type { ThemeOption } from "../domain/types";
import { useLocale } from "@/core/i18n/LocaleContext";

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
  const { t } = useLocale();
  const description =
    selectedThemeOption.description?.trim() || t("map.noDescription");

  return (
    <div className="theme-summary-view">
      <div className="theme-summary-head">
        <div className="theme-summary-copy">
          <p className="theme-summary-label">
            {t("map.themeLabel")}{" "}
            <span className="theme-summary-label-name">{selectedThemeOption.name}</span>
          </p>
          <p className="theme-card-description">{description}</p>
        </div>
        <button
          type="button"
          className="theme-customize-btn"
          onClick={onCustomize}
          aria-label={t("map.customizeThemeColors", {
            name: selectedThemeOption.name,
          })}
        >
          <span className="theme-customize-icon" aria-hidden="true">
            <EditIcon />
          </span>
        </button>
      </div>

      <div
        className="theme-card-list card-scroll-list"
        role="list"
        aria-label={t("map.themeOptions")}
        ref={listRef}
      >
        {themeOptions.map((themeOption) => (
          <ThemeCard
            key={themeOption.id}
            themeOption={themeOption}
            isSelected={themeOption.id === selectedThemeId}
            onClick={() => onThemeSelect(themeOption.id)}
          />
        ))}
      </div>
    </div>
  );
}
