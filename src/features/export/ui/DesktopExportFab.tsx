import { useEffect, useState } from "react";
import { useExport } from "@/features/export/application/useExport";
import type { ExportFormat } from "@/features/export/domain/types";
import { CopyIcon, DownloadIcon, LoaderIcon } from "@/shared/ui/Icons";
import SupportModal from "@/features/export/ui/SupportModal";

export default function DesktopExportFab() {
  const {
    isExporting,
    handleDownloadPng,
    handleDownloadPdf,
    handleDownloadSvg,
    handleCopyToClipboard,
    supportPrompt,
    dismissSupportPrompt,
  } = useExport();
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);

  useEffect(() => {
    if (!isExporting) setActiveFormat(null);
  }, [isExporting]);

  const isLoading = (fmt: ExportFormat) =>
    isExporting && activeFormat === fmt;

  return (
    <>
      <div className={`desktop-export-fab${isExporting ? " is-exporting" : ""}`}>
        {/* SVG + PDF fly out above on hover */}
        <div className="desktop-export-flyout">
          <button
            type="button"
            className="desktop-export-btn desktop-export-btn--clipboard"
            disabled={isExporting}
            onClick={() => { setActiveFormat("clipboard"); void handleCopyToClipboard(); }}
          >
            {isLoading("clipboard")
              ? <LoaderIcon className="desktop-export-btn-icon is-spinning" />
              : <CopyIcon className="desktop-export-btn-icon" />}
            <span>Copy</span>
          </button>
          <button
            type="button"
            className="desktop-export-btn desktop-export-btn--svg"
            disabled={isExporting}
            onClick={() => { setActiveFormat("svg"); void handleDownloadSvg(); }}
          >
            {isLoading("svg")
              ? <LoaderIcon className="desktop-export-btn-icon is-spinning" />
              : <DownloadIcon className="desktop-export-btn-icon" />}
            <span>SVG</span>
          </button>
          <button
            type="button"
            className="desktop-export-btn desktop-export-btn--pdf"
            disabled={isExporting}
            onClick={() => { setActiveFormat("pdf"); void handleDownloadPdf(); }}
          >
            {isLoading("pdf")
              ? <LoaderIcon className="desktop-export-btn-icon is-spinning" />
              : <DownloadIcon className="desktop-export-btn-icon" />}
            <span>PDF</span>
          </button>
        </div>

        {/* Primary PNG button — shows "Download" by default, "PNG" on hover */}
        <button
          type="button"
          className="desktop-export-btn desktop-export-btn--primary"
          disabled={isExporting}
          onClick={() => { setActiveFormat("png"); void handleDownloadPng(); }}
        >
          {isLoading("png")
            ? <LoaderIcon className="desktop-export-btn-icon is-spinning" />
            : <DownloadIcon className="desktop-export-btn-icon" />}
          <span className="desktop-export-label-default">Download</span>
          <span className="desktop-export-label-hover">PNG</span>
        </button>
      </div>

      {supportPrompt ? (
        <SupportModal
          posterNumber={supportPrompt.posterNumber}
          onClose={dismissSupportPrompt}
          titleId="fab-export-support-modal-title"
        />
      ) : null}
    </>
  );
}


