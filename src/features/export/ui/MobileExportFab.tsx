import { useEffect, useState } from "react";
import { useExport } from "@/features/export/application/useExport";
import type { ExportFormat } from "@/features/export/domain/types";
import { CloseIcon, CopyIcon, DownloadIcon, LoaderIcon } from "@/shared/ui/Icons";
import SupportModal from "@/features/export/ui/SupportModal";
import SocialLinkGroup from "@/shared/ui/SocialLinkGroup";

export default function MobileExportFab() {
  const {
    isExporting,
    handleDownloadPng,
    handleDownloadPdf,
    handleDownloadSvg,
    handleCopyToClipboard,
    supportPrompt,
    dismissSupportPrompt,
  } = useExport();
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
    if (format === "png") {
      void handleDownloadPng();
      return;
    }
    if (format === "pdf") {
      void handleDownloadPdf();
      return;
    }
    if (format === "clipboard") {
      void handleCopyToClipboard();
      return;
    }
    void handleDownloadSvg();
  };

  const isLoading = (format: ExportFormat) =>
    isExporting && activeFormat === format;

  return (
    <>
      <button
        type="button"
        className={`mobile-export-fab-trigger${isTriggerVisible ? "" : " is-hidden"}`}
        aria-label="Export poster"
        title="Export poster"
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
          onClick={() => !isExporting && setIsOpen(false)}
        >
          <div
            className="mobile-export-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-export-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-export-modal-header">
              <h3 id="mobile-export-modal-title">Download Poster</h3>
              <button
                type="button"
                className="mobile-export-modal-close"
                onClick={() => !isExporting && setIsOpen(false)}
                aria-label="Close export options"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mobile-export-modal-actions">
              <button
                type="button"
                className="mobile-export-option mobile-export-option--png"
                onClick={() => runExport("png")}
                disabled={isExporting}
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
                disabled={isExporting}
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
                disabled={isExporting}
              >
                {isLoading("svg") ? (
                  <LoaderIcon className="mobile-export-option-icon is-spinning" />
                ) : (
                  <DownloadIcon className="mobile-export-option-icon" />
                )}
                <span>SVG</span>
              </button>
              <button
                type="button"
                className="mobile-export-option mobile-export-option--clipboard"
                onClick={() => runExport("clipboard")}
                disabled={isExporting}
              >
                {isLoading("clipboard") ? (
                  <LoaderIcon className="mobile-export-option-icon is-spinning" />
                ) : (
                  <CopyIcon className="mobile-export-option-icon" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <p className="mobile-export-support-label">
              Support the project <span className="heart">❤︎</span>
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
