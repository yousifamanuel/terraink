import { useEffect, useState } from "react";
import { useLocale } from "@/core/i18n/LocaleContext";
import { useExport } from "@/features/export/application/useExport";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { DownloadIcon, LoaderIcon } from "@/shared/ui/Icons";
import SupportModal from "@/features/export/ui/SupportModal";

export default function DesktopExportFab() {
  const { t } = useLocale();
  const {
    handleDownloadPng,
    handleDownloadPdf,
    handleDownloadSvg,
    supportPrompt,
    dismissSupportPrompt,
  } = useExport();
  const { state } = usePosterContext();
  const [activeFormat, setActiveFormat] = useState<"png" | "pdf" | "svg" | null>(null);

  useEffect(() => {
    if (!state.isExporting) setActiveFormat(null);
  }, [state.isExporting]);

  const isLoading = (fmt: "png" | "pdf" | "svg") =>
    state.isExporting && activeFormat === fmt;

  return (
    <>
      <div className="desktop-export-fab">
        {/* SVG + PDF fly out above on hover */}
        <div className="desktop-export-flyout">
          <button
            type="button"
            className="desktop-export-btn desktop-export-btn--svg"
            disabled={state.isExporting}
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
            disabled={state.isExporting}
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
          disabled={state.isExporting}
          onClick={() => { setActiveFormat("png"); void handleDownloadPng(); }}
        >
          {isLoading("png")
            ? <LoaderIcon className="desktop-export-btn-icon is-spinning" />
            : <DownloadIcon className="desktop-export-btn-icon" />}
          <span className="desktop-export-label-default">
            {t("export.desktop.download")}
          </span>
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

