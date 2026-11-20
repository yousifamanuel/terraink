import { useTranslation } from "react-i18next";
import { isNewFeature } from "../application/useFeatureHints";

/** Small "New" tag next to a feature that a hint marks as new. */
export default function NewLabel({ feature }: { feature: string }) {
  const { t } = useTranslation();
  if (!isNewFeature(feature)) return null;
  return <span className="new-label">{t("hints.new")}</span>;
}
