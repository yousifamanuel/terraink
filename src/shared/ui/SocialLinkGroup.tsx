import { KOFI_URL, REPO_API_URL, REPO_URL, SOCIAL_INSTAGRAM } from "@/core/config";
import { useRepoStars } from "@/shared/hooks/useRepoStars";
import { GitHubIcon, InstagramIcon, DonateIcon, StarIcon } from "@/shared/ui/Icons";
import { trackEvent } from "@/shared/utils/analytics";

interface SocialLinkGroupProps {
  variant: "header" | "mobile-export";
}

export default function SocialLinkGroup({ variant }: SocialLinkGroupProps) {
  const repoUrl = String(REPO_URL ?? "").trim();
  const repoApiUrl = String(REPO_API_URL ?? "").trim();
  const instagramUrl = String(SOCIAL_INSTAGRAM ?? "").trim();
  const kofiUrl = String(KOFI_URL ?? "").trim();
  const { repoStars, repoStarsLoading } = useRepoStars(repoApiUrl);
  const starsText = repoStarsLoading ? "..." : repoStars?.toLocaleString() ?? "Star";

  const rootClassName =
    variant === "header" ? "desktop-header-social" : "mobile-export-social-links";

  return (
    <div className={rootClassName} aria-label="Project links">
      {repoUrl ? (
        <a
          className="general-header-social-btn general-header-social-btn--github"
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open Terraink repository on GitHub"
          title="GitHub repository"
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
          aria-label="Follow Terraink on Instagram"
          title="Instagram"
          onClick={() => trackEvent("follow_click")}
        >
          <InstagramIcon />
        </a>
      ) : null}
      {kofiUrl ? (
        <a
          className="general-header-text-btn"
          href={kofiUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Support Terraink and donate to keep it free"
          title="Support Terraink and donate to keep it free"
          onClick={() => trackEvent("donate_click")}
        >
          <span className="general-header-btn-label">Donate</span>
          <span className="general-header-btn-icon" aria-hidden="true">
            <DonateIcon />
          </span>
        </a>
      ) : null}
    </div>
  );
}
