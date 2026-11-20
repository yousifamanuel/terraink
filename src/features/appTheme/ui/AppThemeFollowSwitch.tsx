import { useTranslation } from "react-i18next";
import { setAppThemeFollow, useAppTheme } from "../application/useAppTheme";

/**
 * "App colors follow theme", on by default: only offered when the app has
 * a start look (e.g. during a campaign). Off: the app keeps its start look.
 */
export default function AppThemeFollowSwitch() {
  const { t } = useTranslation();
  const { follow, canFollow } = useAppTheme();
  if (!canFollow) return null;

  return (
    <label className="toggle-field">
      <span>{t("appTheme.follow")}</span>
      <span className="theme-switch">
        <input
          type="checkbox"
          checked={follow}
          onChange={(event) => setAppThemeFollow(event.target.checked)}
        />
        <span className="theme-switch-track" aria-hidden="true" />
      </span>
    </label>
  );
}
