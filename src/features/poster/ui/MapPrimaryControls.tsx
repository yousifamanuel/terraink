import { useTranslation } from "react-i18next";
import { LockIcon, RecenterIcon, UnlockIcon } from "@/shared/ui/Icons";

interface MapPrimaryControlsProps {
  isMapEditing: boolean;
  isMarkerEditorActive: boolean;
  recenterHint: string;
  unlockHint: string;
  onRecenter: () => void;
  onStartEditing: () => void;
  onFinishEditing: () => void;
}

export default function MapPrimaryControls({
  isMapEditing,
  isMarkerEditorActive,
  recenterHint,
  unlockHint,
  onRecenter,
  onStartEditing,
  onFinishEditing,
}: MapPrimaryControlsProps) {
  const { t } = useTranslation();
  return (
    <>
      {!isMapEditing ? (
        <button
          type="button"
          className="map-control-btn"
          onClick={onRecenter}
          title={recenterHint}
        >
          <RecenterIcon />
          <span>{t("poster.controls.recenter")}</span>
        </button>
      ) : null}
      {isMapEditing ? (
        <button
          type="button"
          className="map-control-btn map-control-btn--primary map-control-btn--mode"
          onClick={onFinishEditing}
          title={t("poster.controls.lockTitle")}
        >
          <LockIcon />
          <span>{t("poster.controls.lockMap")}</span>
        </button>
      ) : (
        <button
          type="button"
          className="map-control-btn map-control-btn--primary map-control-btn--mode"
          onClick={onStartEditing}
          title={unlockHint}
          disabled={isMarkerEditorActive}
        >
          <UnlockIcon />
          <span>{t("poster.controls.editMap")}</span>
        </button>
      )}
    </>
  );
}
