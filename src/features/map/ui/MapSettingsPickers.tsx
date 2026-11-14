import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <>
      <PickerModal
        open={activePicker === "layout"}
        title={t("map.pickers.chooseLayout")}
        titleId="layout-picker-title"
        onClose={onClosePicker}
      >
        <div className="layout-picker-groups">
          {layoutGroups.map((group) => (
            <section
              key={group.id}
              className="layout-picker-group"
              aria-label={t(`layout.groups.${group.id}`, { defaultValue: group.name })}
            >
              <h4>{t(`layout.groups.${group.id}`, { defaultValue: group.name })}</h4>
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
