export default function ContactLegalSection({
  contactEmail,
  legalNoticeUrl,
  privacyUrl,
  hasFooterLinks,
}) {
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
          <a className="footer-link" href={privacyUrl} target="_blank" rel="noreferrer">
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
