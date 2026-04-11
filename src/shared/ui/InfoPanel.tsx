import { useRepoStars } from "@/shared/hooks/useRepoStars";
import {
  REPO_URL,
  REPO_API_URL,
  CONTACT_EMAIL,
  LEGAL_NOTICE_URL,
  PRIVACY_URL,
  SOCIAL_LINKEDIN,
  SOCIAL_INSTAGRAM,
  SOCIAL_REDDIT,
  SOCIAL_THREADS,
  SOCIAL_YOUTUBE,
  KOFI_URL,
} from "@/core/config";
import {
  GitHubIcon,
  StarIcon,
  CheckIcon,
  KofiIcon,
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
  const kofiUrl = String(KOFI_URL ?? "").trim();

  return (
    <section className="info-panel-section">
      <h3>Help Us Grow</h3>
      <p className="hug-copy">
        Terraink is 100% client-side and open-source. Help us build the future
        of map art by contributing to our roadmap!
      </p>

      <div className="hug-rows">
        {/* Support the project */}
        <div className="hug-row">
          <span className="hug-row-label">Support the project</span>
          <div className="hug-row-content">
            {repoUrl ? (
              <a
                className="github-badge"
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open Terraink repository on GitHub"
              >
                <GitHubIcon className="badge-icon" />
                <span>GitHub Repo</span>
              </a>
            ) : (
              <span className="github-badge" style={{ opacity: 0.45 }}>
                <GitHubIcon className="badge-icon" />
                <span>GitHub Repo</span>
              </span>
            )}
            {repoUrl ? (
              <a
                className="github-badge stars-badge"
                href={`${repoUrl}/stargazers`}
                target="_blank"
                rel="noreferrer"
                aria-label="Star Terraink on GitHub"
              >
                <StarIcon className="badge-icon" />
                <span>{starsText !== null ? starsText : "Star"}</span>
              </a>
            ) : (
              <span
                className="github-badge stars-badge"
                style={{ opacity: 0.45 }}
              >
                <StarIcon className="badge-icon" />
                <span>Star</span>
              </span>
            )}
            {kofiUrl ? (
              <a
                className="github-badge"
                href={kofiUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Support Terraink on Ko-fi"
              >
                <KofiIcon className="badge-icon" />
                <span>Support on Ko-fi</span>
              </a>
            ) : (
              <span className="github-badge" style={{ opacity: 0.45 }}>
                <KofiIcon className="badge-icon" />
                <span>Support on Ko-fi</span>
              </span>
            )}
          </div>
        </div>

        {/* Spread the word */}
        <div className="hug-row">
          <span className="hug-row-label">Spread the word</span>
          <div className="hug-row-content social-links-row">
            {socialLinks.map(({ href, Icon, label }) =>
              href ? (
                <a
                  key={label}
                  className="social-badge"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Follow Terraink on ${label}`}
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
          <span className="hug-row-label">Support the mission</span>
          <div className="hug-row-content">
            <span className="hug-credits-note">
              <CheckIcon className="hug-check-icon" />
              Include credits to help others discover the tool
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
