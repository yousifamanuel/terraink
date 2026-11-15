import { useTranslation } from "react-i18next";
import { REPO_API_URL, REPO_URL, SOCIAL_INSTAGRAM } from "@/core/config";
import { useRepoStars } from "@/shared/hooks/useRepoStars";
import { GitHubIcon, InstagramIcon, DonateIcon, StarIcon } from "@/shared/ui/Icons";
import { trackEvent } from "@/shared/utils/analytics";
import LanguageMenu from "@/shared/ui/LanguageMenu";
import DonateLink from "@/shared/ui/DonateLink";

interface SocialLinkGroupProps {
  variant: "header" | "mobile-export";
}

export default function SocialLinkGroup({ variant }: SocialLinkGroupProps) {
  const { t } = useTranslation();
  const repoUrl = String(REPO_URL ?? "").trim();
  const repoApiUrl = String(REPO_API_URL ?? "").trim();
  const instagramUrl = String(SOCIAL_INSTAGRAM ?? "").trim();
  const { repoStars, repoStarsLoading } = useRepoStars(repoApiUrl);
  const starsText = repoStarsLoading ? "..." : repoStars?.toLocaleString() ?? t("shell.info.star");

  const rootClassName =
    variant === "header" ? "desktop-header-social" : "mobile-export-social-links";

  return (
    <div className={rootClassName} aria-label={t("shell.social.projectLinks")}>
      {repoUrl ? (
        <a
          className="general-header-social-btn general-header-social-btn--github"
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("shell.info.openRepo")}
          title={t("shell.social.githubRepository")}
          onClick={() => trackEvent("github_click")}
        >
          <GitHubIcon />
          <span className="general-header-github-stars">
            <span className="general-header-github-stars-count">{starsText}</span>
            <StarIcon />
          </span>
        </a>
      ) : null}
      {instagramUrl ? (
        <a
          className="general-header-social-btn"
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("shell.info.follow", { network: "Instagram" })}
          title="Instagram"
          onClick={() => trackEvent("follow_click", { source: variant })}
        >
          <InstagramIcon />
        </a>
      ) : null}
      {variant === "header" ? <LanguageMenu /> : null}
      <DonateLink className="general-header-text-btn">
        <span className="general-header-btn-label">{t("shell.info.donate")}</span>
        <span className="general-header-btn-icon" aria-hidden="true">
          <DonateIcon />
        </span>
      </DonateLink>
    </div>
  );
}
