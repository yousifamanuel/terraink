import { useTranslation } from "react-i18next";
import { NewsIcon } from "@/shared/ui/Icons";

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
      <span className="news-icon-wrap">
        <NewsIcon aria-hidden="true" />
        <span className="news-dot" aria-hidden="true" />
      </span>
      <span>{t("shell.nav.news")}</span>
    </button>
  );
}
