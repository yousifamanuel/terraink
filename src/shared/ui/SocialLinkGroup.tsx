import { KOFI_URL, REPO_API_URL, REPO_URL, SOCIAL_INSTAGRAM } from "@/core/config";
import { useLocale } from "@/core/i18n/LocaleContext";
import { useRepoStars } from "@/shared/hooks/useRepoStars";
import { GitHubIcon, InstagramIcon, KofiIcon, StarIcon } from "@/shared/ui/Icons";

interface SocialLinkGroupProps {
  variant: "header" | "mobile-export";
}

export default function SocialLinkGroup({ variant }: SocialLinkGroupProps) {
  const { t } = useLocale();
  const repoUrl = String(REPO_URL ?? "").trim();
  const repoApiUrl = String(REPO_API_URL ?? "").trim();
  const instagramUrl = String(SOCIAL_INSTAGRAM ?? "").trim();
  const kofiUrl = String(KOFI_URL ?? "").trim();
  const { repoStars, repoStarsLoading } = useRepoStars(repoApiUrl);
  const starsText = repoStarsLoading ? "..." : repoStars?.toLocaleString() ?? t("social.starsFallback");

  const rootClassName =
    variant === "header" ? "desktop-header-social" : "mobile-export-social-links";

  return (
    <div className={rootClassName} aria-label={t("social.linksLabel")}>
      {repoUrl ? (
        <a
          className="general-header-social-btn general-header-social-btn--github"
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("social.github.openRepo")}
          title={t("social.github.repository")}
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
          aria-label={t("social.instagram.follow")}
          title={t("social.instagram.title")}
        >
          <InstagramIcon />
        </a>
      ) : null}
      {kofiUrl ? (
        <a
          className="general-header-social-btn"
          href={kofiUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("social.kofi.support")}
          title={t("social.kofi.title")}
        >
          <KofiIcon />
        </a>
      ) : null}
    </div>
  );
}
