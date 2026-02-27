import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useRepoStars } from "@/shared/hooks/useRepoStars";
import {
  REPO_URL,
  REPO_API_URL,
  CONTACT_EMAIL,
  LEGAL_NOTICE_URL,
  PRIVACY_URL,
} from "@/core/config";
import { GitHubIcon, StarIcon } from "./Icons";
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

function RepositorySection({
  repoUrl,
  repoStars,
  repoStarsLoading,
}: {
  repoUrl: string;
  repoStars: number | null;
  repoStarsLoading: boolean;
}) {
  const starsLabel = repoStarsLoading
    ? "Loading stars..."
    : repoStars === null
      ? "Stars unavailable"
      : `${repoStars.toLocaleString()} stars`;

  return (
    <section className="info-panel-section">
      <h3>Repository</h3>
      <div className="repo-actions">
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
          <span className="github-badge" style={{ opacity: 0.5 }}>
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
            aria-label="View stargazers on GitHub"
          >
            <StarIcon className="badge-icon" />
            <span>{starsLabel}</span>
          </a>
        ) : (
          <span className="github-badge stars-badge" style={{ opacity: 0.5 }}>
            <StarIcon className="badge-icon" />
            <span>{starsLabel}</span>
          </span>
        )}
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
        <RepositorySection
          repoUrl={repoUrl}
          repoStars={repoStars}
          repoStarsLoading={repoStarsLoading}
        />
        <ContactLegalSection />
      </div>
    </aside>
  );
}
