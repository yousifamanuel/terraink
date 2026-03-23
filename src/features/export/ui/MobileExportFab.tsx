import { useEffect, useState } from "react";
import { useLocale } from "@/core/i18n/LocaleContext";
import { useExport } from "@/features/export/application/useExport";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { CloseIcon, DownloadIcon, LoaderIcon } from "@/shared/ui/Icons";
import SupportModal from "@/features/export/ui/SupportModal";
import SocialLinkGroup from "@/shared/ui/SocialLinkGroup";

type ExportFormat = "png" | "pdf" | "svg";

export default function MobileExportFab() {
  const { t } = useLocale();
  const {
    handleDownloadPng,
    handleDownloadPdf,
    handleDownloadSvg,
    supportPrompt,
    dismissSupportPrompt,
  } = useExport();
  const { state } = usePosterContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);
  const [isTriggerVisible, setIsTriggerVisible] = useState(true);

  useEffect(() => {
    if (!state.isExporting) {
      setActiveFormat(null);
    }
  }, [state.isExporting]);

  useEffect(() => {
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
  }, []);

  const runExport = (format: ExportFormat) => {
    setActiveFormat(format);
    setIsOpen(false);
    if (format === "png") {
      void handleDownloadPng();
      return;
    }
    if (format === "pdf") {
      void handleDownloadPdf();
      return;
    }
    void handleDownloadSvg();
  };

  const isLoading = (format: ExportFormat) =>
    state.isExporting && activeFormat === format;

  return (
    <>
      <button
        type="button"
        className={`mobile-export-fab-trigger${isTriggerVisible ? "" : " is-hidden"}`}
        aria-label={t("export.mobile.trigger")}
        title={t("export.mobile.trigger")}
        onClick={() => setIsOpen(true)}
        tabIndex={isTriggerVisible ? 0 : -1}
        aria-hidden={!isTriggerVisible}
      >
        <DownloadIcon />
      </button>

      {isOpen ? (
        <div
          className="mobile-export-modal-backdrop"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="mobile-export-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-export-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-export-modal-header">
              <h3 id="mobile-export-modal-title">{t("export.mobile.title")}</h3>
              <button
                type="button"
                className="mobile-export-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label={t("export.mobile.close")}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mobile-export-modal-actions">
              <button
                type="button"
                className="mobile-export-option mobile-export-option--png"
                onClick={() => runExport("png")}
                disabled={state.isExporting}
              >
                {isLoading("png") ? (
                  <LoaderIcon className="mobile-export-option-icon is-spinning" />
                ) : (
                  <DownloadIcon className="mobile-export-option-icon" />
                )}
                <span>PNG</span>
              </button>
              <button
                type="button"
                className="mobile-export-option mobile-export-option--pdf"
                onClick={() => runExport("pdf")}
                disabled={state.isExporting}
              >
                {isLoading("pdf") ? (
                  <LoaderIcon className="mobile-export-option-icon is-spinning" />
                ) : (
                  <DownloadIcon className="mobile-export-option-icon" />
                )}
                <span>PDF</span>
              </button>
              <button
                type="button"
                className="mobile-export-option mobile-export-option--svg"
                onClick={() => runExport("svg")}
                disabled={state.isExporting}
              >
                {isLoading("svg") ? (
                  <LoaderIcon className="mobile-export-option-icon is-spinning" />
                ) : (
                  <DownloadIcon className="mobile-export-option-icon" />
                )}
                <span>SVG</span>
              </button>
            </div>
            <p className="mobile-export-support-label">
              {t("export.mobile.supportLabel")} <span className="heart">❤︎</span>
            </p>
            <SocialLinkGroup variant="mobile-export" />
          </div>
        </div>
      ) : null}

      {supportPrompt ? (
        <SupportModal
          posterNumber={supportPrompt.posterNumber}
          onClose={dismissSupportPrompt}
          titleId="mobile-export-support-modal-title"
        />
      ) : null}
    </>
  );
}
