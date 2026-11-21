import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { UPDATES_URL } from "@/core/config";
import { resolveUpdateImage } from "@/core/services";
import type { UpdateCategory, UpdatePoint, UpdateRelease } from "../domain/types";

interface CategoryMeta {
  icon: string;
  labelKey: string;
}

const categoryConfig: Record<UpdateCategory, CategoryMeta> = {
  new: { icon: "✨", labelKey: "updates.categories.new" },
  fixed: { icon: "🛠️", labelKey: "updates.categories.fixed" },
  improved: { icon: "🚀", labelKey: "updates.categories.improved" },
  info: { icon: "ℹ️", labelKey: "updates.categories.info" },
  community: { icon: "👥", labelKey: "updates.categories.community" },
  docs: { icon: "📚", labelKey: "updates.categories.docs" },
  roadmap: { icon: "🎯", labelKey: "updates.categories.roadmap" },
  removed: { icon: "🗑️", labelKey: "updates.categories.removed" },
  security: { icon: "🔒", labelKey: "updates.categories.security" },
  breaking: { icon: "⚠️", labelKey: "updates.categories.breaking" },
  major: { icon: "👑", labelKey: "updates.categories.major" },
  perf: { icon: "⚡", labelKey: "updates.categories.perf" },
  core: { icon: "🧭", labelKey: "updates.categories.core" },
};

function toDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
}

function renderPointText(text: string) {
  const separatorIndex = text.indexOf(":");
  if (separatorIndex <= 0) {
    return <span>{text}</span>;
  }

  const what = text.slice(0, separatorIndex).trim();
  const why = text.slice(separatorIndex + 1).trim();

  return (
    <span>
      <strong>{what}:</strong> {why}
    </span>
  );
}

/** A release's summary points; the first step points when it has none. */
function summaryPointsOf(release: UpdateRelease): UpdatePoint[] {
  if (Array.isArray(release.summary?.points) && release.summary.points.length > 0) {
    return release.summary.points;
  }
  return release.steps.flatMap((step) => step.points).slice(0, 4);
}

function PointList({ points }: { points: UpdatePoint[] }) {
  const { t } = useTranslation();
  return (
    <ul className="updates-points">
      {points.map((point, index) => {
        const category = categoryConfig[point.type] ?? categoryConfig.improved;
        return (
          <li key={`${point.type}-${index}`} className={`updates-point updates-point--${point.type}`}>
            <span className="updates-point-icon" aria-hidden="true">
              {category.icon}
            </span>
            <div className="updates-point-text">
              <span className="updates-point-label">{t(category.labelKey)}</span>
              {renderPointText(point.text)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** An older release below the newest one, shown by scrolling down. */
function OlderRelease({ release }: { release: UpdateRelease }) {
  const { t } = useTranslation();
  const image = resolveUpdateImage(release.image ?? null, UPDATES_URL);
  return (
    <section className="updates-older-release">
      {image ? <img className="updates-older-cover" src={image} alt="" width={1500} height={500} /> : null}
      <span className="updates-version-badge">{t("updates.version", { version: release.version })}</span>
      <h3 className="updates-older-title">
        {release.labels?.summaryTitle?.trim() || t("updates.whatIsNew")}
      </h3>
      <p className="updates-released-on">
        {t("updates.releasedOn", { date: toDisplayDate(release.date) })}
      </p>
      <h4 className="updates-older-heading">
        {release.summary?.title?.trim() || t("updates.quickHighlights")}
      </h4>
      <PointList points={summaryPointsOf(release)} />
    </section>
  );
}

interface NewsModalProps {
  /** Newest first; the first one leads, older ones follow below. */
  releases: UpdateRelease[];
  onClose: () => void;
}

/** The release notes, opened from News: a summary, then step by step. */
export default function NewsModal({ releases, onClose }: NewsModalProps) {
  const { t } = useTranslation();
  const [release, ...olderReleases] = releases;
  const [viewMode, setViewMode] = useState<"summary" | "details">("summary");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const totalSteps = release.steps.length;
  const isDetailsMode = viewMode === "details" && totalSteps > 0;
  const isLastStep = totalSteps > 0 && currentStep === totalSteps - 1;
  const progressPercent = isDetailsMode
    ? Math.round(((currentStep + 1) / totalSteps) * 100)
    : 0;
  const activeStep = release.steps[currentStep] ?? null;
  const summaryPoints = useMemo(() => summaryPointsOf(release), [release]);
  const summaryTitle = release.summary?.title?.trim() || t("updates.quickHighlights");
  const summaryHeaderTitle = release.labels?.summaryTitle?.trim() || t("updates.whatIsNew");
  const detailsHeaderTitle =
    release.labels?.detailsTitle?.trim() || t("updates.updateDetails");

  function handleNext() {
    if (isLastStep) {
      onClose();
      return;
    }
    setCurrentStep((value) => Math.min(value + 1, totalSteps - 1));
  }

  function handleBack() {
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  const coverImage = resolveUpdateImage(release.image ?? null, UPDATES_URL);
  const resolvedImagePath =
    isDetailsMode && activeStep ? resolveUpdateImage(activeStep.image, UPDATES_URL) : null;

  return (
    <div className="updates-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="updates-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="updates-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {isDetailsMode ? (
          <div className="updates-modal-progress">
            <div
              className="updates-modal-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}

        <button
          type="button"
          className="updates-modal-close"
          onClick={onClose}
          aria-label={t("updates.close")}
        >
          <IoClose className="updates-modal-close-icon" />
        </button>

        {/* Picture, title and notes scroll together, so older releases read in turn. */}
        <div className="updates-modal-body">
          {!isDetailsMode && coverImage ? (
            <img
              className="updates-cover-image"
              src={coverImage}
              alt=""
              width={1500}
              height={500}
            />
          ) : null}

          <header className="updates-modal-header">
            <span className="updates-version-badge">{t("updates.version", { version: release.version })}</span>
            <h2 id="updates-modal-title">
              {isDetailsMode ? detailsHeaderTitle : summaryHeaderTitle}
            </h2>
            <p className="updates-released-on">
              {t("updates.releasedOn", { date: toDisplayDate(release.date) })}
            </p>
          </header>

          <div className="updates-modal-content">
            <h3>{isDetailsMode ? activeStep?.title : summaryTitle}</h3>
            <PointList points={isDetailsMode && activeStep ? activeStep.points : summaryPoints} />
            {isDetailsMode && resolvedImagePath ? (
              <img
                className="updates-step-image"
                src={resolvedImagePath}
                alt={t("updates.previewAlt", { title: activeStep?.title ?? "" })}
              />
            ) : null}
            {!isDetailsMode
              ? olderReleases.map((older) => <OlderRelease key={older.version} release={older} />)
              : null}
          </div>
        </div>

        <footer className="updates-modal-footer">
          <div className="updates-footer-row">
            <div className="updates-actions">
              {isDetailsMode ? (
                <>
                  <button type="button" onClick={handleBack} disabled={currentStep === 0}>
                    {t("updates.back")}
                  </button>
                  <button
                    type="button"
                    className="updates-next-button"
                    onClick={handleNext}
                  >
                    {isLastStep ? t("updates.finish") : t("updates.next")}
                  </button>
                </>
              ) : (
                <>
                  {totalSteps > 0 ? (
                    <button
                      type="button"
                      className="updates-next-button"
                      onClick={() => setViewMode("details")}
                    >
                      {t("updates.showAll")}
                    </button>
                  ) : null}
                  <button type="button" className="updates-okay-button" onClick={onClose}>
                    {t("updates.closeButton")}
                  </button>
                </>
              )}
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
