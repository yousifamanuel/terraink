import ContactLegalSection from "./ContactLegalSection";
import RenderStatsSection from "./RenderStatsSection";
import RepositorySection from "./RepositorySection";

export default function InfoPanel({
  result,
  repoUrl,
  repoStars,
  repoStarsLoading,
  contactEmail,
  legalNoticeUrl,
  privacyUrl,
  hasFooterLinks,
}) {
  return (
    <aside className="info-panel">
      <div className="info-panel-group">
        <RenderStatsSection result={result} />
        <RepositorySection
          repoUrl={repoUrl}
          repoStars={repoStars}
          repoStarsLoading={repoStarsLoading}
        />
        <ContactLegalSection
          contactEmail={contactEmail}
          legalNoticeUrl={legalNoticeUrl}
          privacyUrl={privacyUrl}
          hasFooterLinks={hasFooterLinks}
        />
      </div>
    </aside>
  );
}
