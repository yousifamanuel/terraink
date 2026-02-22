export default function PreviewPanel({
  canvasRef,
  selectedTheme,
  isGenerating,
  status,
  generationProgress,
  result,
}) {
  return (
    <section className="preview-panel">
      <div
        className="poster-viewport"
        style={{
          "--poster-bg": selectedTheme.bg,
        }}
      >
        <canvas ref={canvasRef} />
        {isGenerating ? (
          <div className="preview-loading" role="status" aria-live="polite">
            <p className="loading-title">{status || "Generating poster..."}</p>
            <div
              className="loading-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={generationProgress}
            >
              <span
                className="loading-fill"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="loading-meta">{generationProgress}% complete</p>
          </div>
        ) : !result ? (
          <div className="preview-placeholder">
            Generate a poster to see the preview.
          </div>
        ) : null}
      </div>
    </section>
  );
}
