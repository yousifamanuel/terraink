import { usePosterContext } from "@/features/poster/ui/PosterContext";
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
import type { RenderResult } from "@/features/poster/domain/types";

/* ── sub-components ── */

function RenderStatsSection({ result }: { result: RenderResult | null }) {
  return (
    <section className="info-panel-section">
      <h3>Render Stats</h3>
      {result ? (
        <>
          <p>
            Center: {result.center.lat.toFixed(5)},{" "}
            {result.center.lon.toFixed(5)}
          </p>
          <p>
            Layers: {result.roads} roads, {result.water} water, {result.parks}{" "}
            parks, {result.buildings} buildings
          </p>
          <p>
            Output: {result.size.width}x{result.size.height}px
            {result.size.downscaleFactor < 1 ? " (downscaled)" : ""}
          </p>
          <p>
            Print size: {result.widthCm.toFixed(1)}x{result.heightCm.toFixed(1)}{" "}
            cm
          </p>
        </>
      ) : (
        <p>No render yet. Use the controls to generate a poster.</p>
      )}
    </section>
  );
}

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

  return (
    <section className="info-panel-section">
      <h3>Help Us Grow</h3>
      <p className="hug-copy">
        Terraink is 100% client-side and open-source. Help us build the future
        of map art by contributing to our roadmap!
      </p>

      <div className="hug-rows">
        {/* Join the project */}
        <div className="hug-row">
          <span className="hug-row-label">Join the project</span>
          <div className="hug-row-content">
            {repoUrl ? (
              <a
                className="github-badge"
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open TerraInk repository on GitHub"
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
                aria-label="Star TerraInk on GitHub"
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
                  aria-label={`Follow TerraInk on ${label}`}
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

function ContactLegalSection() {
  const contactEmail = String(CONTACT_EMAIL ?? "").trim();
  const legalNoticeUrl = String(LEGAL_NOTICE_URL ?? "").trim();
  const privacyUrl = String(PRIVACY_URL ?? "").trim();
  const hasFooterLinks = Boolean(contactEmail || legalNoticeUrl || privacyUrl);

  return (
    <section className="info-panel-section">
      <h3>Contact and Legal</h3>
      <section className="footer-links" aria-label="Contact and legal links">
        {contactEmail ? (
          <a className="footer-link" href={`mailto:${contactEmail}`}>
            Contact: {contactEmail}
          </a>
        ) : null}
        {legalNoticeUrl ? (
          <a
            className="footer-link"
            href={legalNoticeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Imprint
          </a>
        ) : null}
        {privacyUrl ? (
          <a
            className="footer-link"
            href={privacyUrl}
            target="_blank"
            rel="noreferrer"
          >
            Data Privacy
          </a>
        ) : null}
        {!hasFooterLinks ? (
          <p className="footer-links-note">
            Set VITE_CONTACT_EMAIL, VITE_LEGAL_NOTICE_URL, and VITE_PRIVACY_URL
            in your environment to show contact and legal links.
          </p>
        ) : null}
      </section>
    </section>
  );
}

/* ── main panel ── */

export default function InfoPanel() {
  const { state } = usePosterContext();
  const repoUrl = String(REPO_URL ?? "").trim();
  const { repoStars, repoStarsLoading } = useRepoStars(REPO_API_URL);

  return (
    <aside className="info-panel">
      <div className="info-panel-group">
        <RenderStatsSection result={state.result} />
        <HelpUsGrowSection
          repoUrl={repoUrl}
          repoStars={repoStars}
          repoStarsLoading={repoStarsLoading}
        />
        <ContactLegalSection />
      </div>
    </aside>
  );
}
