import ThemeCard from "./ThemeCard";

export default function ThemeSummarySection({
  themeName,
  themeOption,
  onCustomize,
  onOpenThemePicker,
}) {
  return (
    <div className="theme-section">
      <div className="theme-summary-view">
        <div className="theme-summary-header">
          <p className="theme-active-label">Theme: {themeName}</p>
          <button
            type="button"
            className="theme-customize-btn"
            onClick={onCustomize}
            aria-label="Customize theme colors"
          >
            <span className="theme-customize-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.79z" />
              </svg>
            </span>
            Customize
          </button>
        </div>
        <ThemeCard
          themeOption={themeOption}
          showName={false}
          onClick={onOpenThemePicker}
        />
      </div>
    </div>
  );
}
