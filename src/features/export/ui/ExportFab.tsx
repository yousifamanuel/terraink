import { useEffect, useState } from "react";
import { useExport } from "@/features/export/application/useExport";
import type { ExportFormat } from "@/features/export/domain/types";
import { CloseIcon, DownloadIcon, LoaderIcon } from "@/shared/ui/Icons";
import { useTranslation } from "react-i18next";
import SocialLinkGroup from "@/shared/ui/SocialLinkGroup";

const FORMAT_OPTIONS: { format: ExportFormat; label: string }[] = [
  { format: "png", label: "PNG" },
  { format: "pdf", label: "PDF" },
  { format: "svg", label: "RSVG" },
];

interface ExportFabProps {
  isMobile: boolean;
}

export default function ExportFab({ isMobile }: ExportFabProps) {
  const { t } = useTranslation();
  const { isExporting, exportPoster } = useExport();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);
  const [isTriggerVisible, setIsTriggerVisible] = useState(true);

  useEffect(() => {
    if (!isExporting && activeFormat) {
      setActiveFormat(null);
      setIsOpen(false);
    }
  }, [isExporting, activeFormat]);

  useEffect(() => {
    if (!isMobile) return;

    const FOOTER_OVERLAP_THRESHOLD_PX = 140;

    const updateVisibility = () => {
      const doc = document.documentElement;
      const scrolledToBottom =
        window.scrollY + window.innerHeight >=
        doc.scrollHeight - FOOTER_OVERLAP_THRESHOLD_PX;
      setIsTriggerVisible(!scrolledToBottom);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [isMobile]);

  const runExport = (format: ExportFormat) => {
    setActiveFormat(format);
    void exportPoster(format);
  };

  const triggerClass = isMobile
    ? `mobile-export-fab-trigger${isTriggerVisible ? "" : " is-hidden"}`
    : "export-fab-trigger-desktop";

  return (
    <>
      <button
        type="button"
        className={triggerClass}
        aria-label={t("export.fab.exportPoster")}
        title={t("export.fab.exportPoster")}
        onClick={() => setIsOpen(true)}
        tabIndex={isMobile && !isTriggerVisible ? -1 : 0}
        aria-hidden={isMobile && !isTriggerVisible}
      >
        <DownloadIcon />
        {!isMobile && <span>{t("export.fab.download")}</span>}
      </button>

      {isOpen ? (
        <div
          className="export-modal-backdrop"
          role="presentation"
          onClick={() => !isExporting && setIsOpen(false)}
        >
          <div
            className="export-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="export-modal-header">
              <h3 id="export-modal-title">{t("export.fab.downloadPoster")}</h3>
              <button
                type="button"
                className="export-modal-close"
                onClick={() => !isExporting && setIsOpen(false)}
                aria-label={t("export.fab.closeOptions")}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="export-modal-actions">
              {FORMAT_OPTIONS.map(({ format, label }) => (
                <button
                  key={format}
                  type="button"
                  className={`export-modal-option export-modal-option--${format}`}
                  onClick={() => runExport(format)}
                  disabled={isExporting}
                >
                  {isExporting && activeFormat === format ? (
                    <LoaderIcon className="export-modal-option-icon is-spinning" />
                  ) : (
                    <DownloadIcon className="export-modal-option-icon" />
                  )}
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <p className="export-modal-support-label">
              {t("export.fab.supportProject")} <span className="heart">❤︎</span>
            </p>
            <SocialLinkGroup variant="mobile-export" />
          </div>
        </div>
      ) : null}
    </>
  );
}
