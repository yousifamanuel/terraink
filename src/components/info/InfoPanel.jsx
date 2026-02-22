import ContactLegalSection from "./ContactLegalSection";
import RenderStatsSection from "./RenderStatsSection";
import RepositorySection from "./RepositorySection";
import ThemePaletteCard from "./ThemePaletteCard";

export default function InfoPanel({
  selectedTheme,
  themePalette,
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
      <ThemePaletteCard themePalette={themePalette} selectedTheme={selectedTheme} />

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
