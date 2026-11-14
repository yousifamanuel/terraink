import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { DONATION_LINKS, type DonationLink } from "@/core/config";
import { CloseIcon, ExternalLinkIcon } from "@/shared/ui/Icons";
import { trackEvent } from "@/shared/utils/analytics";

interface DonateLinkProps {
  className: string;
  children: ReactNode;
  /** Shown when no donation link is configured; omit to render nothing. */
  fallback?: ReactNode;
}

const hostOf = (url: string) => url.replace(/^https?:\/\//i, "").split("/")[0];

/**
 * Donate button driven by VITE_DONATION_LINKS: one link opens it directly,
 * several open a list window.
 */
export default function DonateLink({ className, children, fallback = null }: DonateLinkProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const label = t("shell.info.donateLabel");

  if (DONATION_LINKS.length === 0) return <>{fallback}</>;

  if (DONATION_LINKS.length === 1) {
    const [link] = DONATION_LINKS;
    return (
      <a
        className={className}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        aria-label={label}
        title={label}
        onClick={() => trackEvent("donate_click", { target: link.name })}
      >
        {children}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={label}
        title={label}
        aria-haspopup="dialog"
        onClick={() => {
          trackEvent("donate_open");
          setOpen(true);
        }}
      >
        {children}
      </button>
      {open ? <DonateModal links={DONATION_LINKS} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function DonateModal({ links, onClose }: { links: DonationLink[]; onClose: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="donate-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="donate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="donate-modal-close"
          onClick={onClose}
          aria-label={t("shell.common.close")}
        >
          <CloseIcon />
        </button>
        <h2 className="donate-modal-title" id="donate-modal-title">
          {t("shell.info.donate")}
        </h2>
        <p className="donate-modal-intro">{t("shell.donate.intro")}</p>
        <ul className="donate-modal-list">
          {links.map((link) => (
            <li key={link.url}>
              <a
                className="donate-modal-link"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                onClick={() => trackEvent("donate_click", { target: link.name })}
              >
                <span className="donate-modal-link-text">
                  <span className="donate-modal-link-name">{link.name}</span>
                  <span className="donate-modal-link-host">{hostOf(link.url)}</span>
                </span>
                <ExternalLinkIcon aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
