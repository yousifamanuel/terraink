import LayoutCard from "@/features/layout/ui/LayoutCard";
import PickerModal from "@/shared/ui/PickerModal";
import ThemeCard from "@/features/theme/ui/ThemeCard";
import type { ThemeOption } from "@/features/theme/domain/types";
import type { LayoutGroup } from "@/features/layout/domain/types";

interface MapSettingsPickersProps {
  activePicker: string;
  onClosePicker: () => void;
  themeOptions: ThemeOption[];
  selectedThemeId: string;
  onThemeSelect: (themeId: string) => void;
  layoutGroups: LayoutGroup[];
  selectedLayoutId: string;
  onLayoutSelect: (layoutId: string) => void;
}

export default function MapSettingsPickers({
  activePicker,
  onClosePicker,
  themeOptions,
  selectedThemeId,
  onThemeSelect,
  layoutGroups,
  selectedLayoutId,
  onLayoutSelect,
}: MapSettingsPickersProps) {
  return (
    <>
      <PickerModal
        open={activePicker === "theme"}
        title="Choose Theme"
        titleId="theme-picker-title"
        onClose={onClosePicker}
      >
        <div className="picker-option-list">
          {themeOptions.map((themeOption) => (
            <ThemeCard
              key={themeOption.id}
              themeOption={themeOption}
              isSelected={themeOption.id === selectedThemeId}
              onClick={() => onThemeSelect(themeOption.id)}
            />
          ))}
        </div>
      </PickerModal>

      <PickerModal
        open={activePicker === "layout"}
        title="Choose Layout"
        titleId="layout-picker-title"
        onClose={onClosePicker}
      >
        <div className="layout-picker-groups">
          {layoutGroups.map((group) => (
            <section
              key={group.id}
              className="layout-picker-group"
              aria-label={group.name}
            >
              <h4>{group.name}</h4>
              <div className="picker-option-list">
                {group.options.map((layoutOption) => (
                  <LayoutCard
                    key={layoutOption.id}
                    layoutOption={layoutOption}
                    isSelected={layoutOption.id === selectedLayoutId}
                    onClick={() => onLayoutSelect(layoutOption.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </PickerModal>
    </>
  );
}
