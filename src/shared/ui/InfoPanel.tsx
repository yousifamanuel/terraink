import { useTranslation } from "react-i18next";
import DonateLink from "@/shared/ui/DonateLink";
import { useRepoStars } from "@/shared/hooks/useRepoStars";
import { trackEvent } from "@/shared/utils/analytics";
import {
  REPO_URL,
  REPO_API_URL,
  CONTACT_EMAIL,
  SOCIAL_LINKEDIN,
  SOCIAL_INSTAGRAM,
  SOCIAL_REDDIT,
  SOCIAL_THREADS,
  SOCIAL_YOUTUBE,
} from "@/core/config";
import {
  GitHubIcon,
  StarIcon,
  CheckIcon,
  LinkedInIcon,
  InstagramIcon,
  RedditIcon,
  ThreadsIcon,
  YouTubeIcon,
} from "./Icons";

/* ── sub-components ── */

function HelpUsGrowSection({
  repoUrl,
  repoStars,
  repoStarsLoading,
}: {
  repoUrl: string;
  repoStars: number | null;
  repoStarsLoading: boolean;
}) {
  const { t } = useTranslation();
  const starsText = repoStarsLoading
    ? "…"
    : repoStars !== null
      ? repoStars.toLocaleString()
      : null;

  const socialLinks = [
    {
      href: String(SOCIAL_LINKEDIN ?? "").trim(),
      Icon: LinkedInIcon,
      label: "LinkedIn",
    },
    {
      href: String(SOCIAL_INSTAGRAM ?? "").trim(),
      Icon: InstagramIcon,
      label: "Instagram",
    },
    {
      href: String(SOCIAL_REDDIT ?? "").trim(),
      Icon: RedditIcon,
      label: "Reddit",
    },
    {
      href: String(SOCIAL_THREADS ?? "").trim(),
      Icon: ThreadsIcon,
      label: "Threads",
    },
    {
      href: String(SOCIAL_YOUTUBE ?? "").trim(),
      Icon: YouTubeIcon,
      label: "YouTube",
    },
  ];

  return (
    <section className="info-panel-section">
      <h3>{t("shell.info.helpTitle")}</h3>
      <p className="hug-copy">
        {t("shell.info.helpCopy")}
      </p>

      <div className="hug-rows">
        {/* Support the project */}
        <div className="hug-row">
          <span className="hug-row-label">{t("shell.info.supportProject")}</span>
          <div className="hug-row-content">
            {repoUrl ? (
              <a
                className="github-badge"
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={t("shell.info.openRepo")}
                onClick={() => trackEvent("github_click")}
              >
                <GitHubIcon className="badge-icon" />
                <span>{t("shell.info.githubRepo")}</span>
              </a>
            ) : (
              <span className="github-badge" style={{ opacity: 0.45 }}>
                <GitHubIcon className="badge-icon" />
                <span>{t("shell.info.githubRepo")}</span>
              </span>
            )}
            {repoUrl ? (
              <a
                className="github-badge stars-badge"
                href={`${repoUrl}/stargazers`}
                target="_blank"
                rel="noreferrer"
                aria-label={t("shell.info.starRepo")}
              >
                <StarIcon className="badge-icon" />
                <span>{starsText !== null ? starsText : t("shell.info.star")}</span>
              </a>
            ) : (
              <span
                className="github-badge stars-badge"
                style={{ opacity: 0.45 }}
              >
                <StarIcon className="badge-icon" />
                <span>{t("shell.info.star")}</span>
              </span>
            )}
            <DonateLink
              className="github-badge"
              fallback={
                <span className="github-badge" style={{ opacity: 0.45 }}>
                  <span>{t("shell.info.donate")}</span>
                </span>
              }
            >
              <span>{t("shell.info.donate")}</span>
            </DonateLink>
          </div>
        </div>

        {/* Spread the word */}
        <div className="hug-row">
          <span className="hug-row-label">{t("shell.info.spreadWord")}</span>
          <div className="hug-row-content social-links-row">
            {socialLinks.map(({ href, Icon, label }) =>
              href ? (
                <a
                  key={label}
                  className="social-badge"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("shell.info.follow", { network: label })}
                  title={label}
                >
                  <Icon className="social-icon" />
                </a>
              ) : (
                <span
                  key={label}
                  className="social-badge social-badge--inactive"
                  title={label}
                >
                  <Icon className="social-icon" />
                </span>
              ),
            )}
          </div>
        </div>

        {/* Support the mission */}
        <div className="hug-row">
          <span className="hug-row-label">{t("shell.info.supportMission")}</span>
          <div className="hug-row-content">
            <span className="hug-credits-note">
              <CheckIcon className="hug-check-icon" />
              {t("shell.info.credits")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── main panel ── */

export default function InfoPanel() {
  const repoUrl = String(REPO_URL ?? "").trim();
  const { repoStars, repoStarsLoading } = useRepoStars(REPO_API_URL);

  return (
    <aside className="info-panel">
      <div className="info-panel-group">
        <HelpUsGrowSection
          repoUrl={repoUrl}
          repoStars={repoStars}
          repoStarsLoading={repoStarsLoading}
        />
      </div>
    </aside>
  );
}
