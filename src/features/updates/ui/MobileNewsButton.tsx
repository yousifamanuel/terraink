import { useTranslation } from "react-i18next";
import { NewsIcon } from "@/shared/ui/Icons";
import NavDot from "@/shared/ui/NavDot";

interface MobileNewsButtonProps {
  onOpen: () => void;
}

/**
 * Mobile only: sits next to the Download button while there is unread news.
 * Once opened it goes away; News stays reachable in About.
 */
export default function MobileNewsButton({ onOpen }: MobileNewsButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="mobile-news-btn"
      onClick={onOpen}
      aria-label={t("shell.nav.news")}
    >
      <span className="nav-icon-wrap">
        <NewsIcon aria-hidden="true" />
        <NavDot count />
      </span>
      <span>{t("shell.nav.news")}</span>
    </button>
  );
}
