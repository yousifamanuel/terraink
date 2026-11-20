import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { Campaign } from "../application/activeCampaign";

/**
 * Announcement at the top of the startup window while a campaign runs,
 * painted in its main theme's colors.
 */
export default function CampaignIntro({ campaign }: { campaign: Campaign }) {
  const { t, i18n } = useTranslation();
  // Sentences mixing Latin names into right-to-left text (Arabic) need their
  // own direction; the window's layout stays left-to-right.
  const dir = i18n.dir(i18n.language);
  const style = {
    "--campaign-bg": campaign.colors.bg,
    "--campaign-text": campaign.colors.text,
    "--campaign-accent": campaign.colors.accent,
  } as CSSProperties;

  return (
    <div className="campaign-intro" style={style}>
      <p className="campaign-intro-title" dir={dir}>
        {t("campaigns.intro.title", { name: campaign.name })}
      </p>
      <p className="campaign-intro-hint" dir={dir}>{t("campaigns.intro.hint")}</p>
    </div>
  );
}
