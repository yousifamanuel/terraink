import LayoutCard from "@/features/layout/ui/LayoutCard";
import PickerModal from "@/shared/ui/PickerModal";
import type { LayoutGroup } from "@/features/layout/domain/types";

interface MapSettingsPickersProps {
  activePicker: string;
  onClosePicker: () => void;
  layoutGroups: LayoutGroup[];
  selectedLayoutId: string;
  onLayoutSelect: (layoutId: string) => void;
}

export default function MapSettingsPickers({
  activePicker,
  onClosePicker,
  layoutGroups,
  selectedLayoutId,
  onLayoutSelect,
}: MapSettingsPickersProps) {
  return (
    <>
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
              <div className="picker-option-list card-scroll-list">
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
