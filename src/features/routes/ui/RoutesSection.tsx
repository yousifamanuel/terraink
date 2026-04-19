import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useGpxUpload } from "@/features/routes/application/useGpxUpload";
import type { GpxTrack } from "@/features/routes/domain/types";
import {
  GPX_LINE_STYLES,
  MAX_GPX_OPACITY,
  MAX_GPX_STROKE_WIDTH,
  MIN_GPX_OPACITY,
  MIN_GPX_STROKE_WIDTH,
} from "@/features/routes/domain/constants";
import ColorPicker from "@/features/theme/ui/ColorPicker";
import { buildDynamicColorChoices } from "@/features/theme/domain/colorSuggestions";
import {
  DISPLAY_PALETTE_KEYS,
  type ThemeColorKey,
} from "@/features/theme/domain/types";
import { getThemeColorByPath } from "@/features/theme/domain/colorPaths";
import { CloseIcon, TrashIcon } from "@/shared/ui/Icons";

function countTrackPoints(track: GpxTrack): number {
  return track.segments.reduce((sum, seg) => sum + seg.length, 0);
}

export default function RoutesSection() {
  const { state, dispatch, effectiveTheme } = usePosterContext();
  const { form, gpxTracks } = state;
  const { uploadGpxFile } = useGpxUpload();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openTrackId, setOpenTrackId] = useState<string | null>(null);
  const [openColorPickerId, setOpenColorPickerId] = useState<string | null>(
    null,
  );

  const palette = useMemo(
    () =>
      DISPLAY_PALETTE_KEYS.map((key) =>
        getThemeColorByPath(effectiveTheme, key as ThemeColorKey),
      ).filter(Boolean),
    [effectiveTheme],
  );

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleUploadChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setUploadError(null);
      setIsUploading(true);
      try {
        await uploadGpxFile(file);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [uploadGpxFile],
  );

  const updateTrack = useCallback(
    (trackId: string, changes: Partial<GpxTrack>) => {
      dispatch({ type: "UPDATE_GPX_TRACK", trackId, changes });
    },
    [dispatch],
  );

  const removeTrack = useCallback(
    (trackId: string) => {
      dispatch({ type: "REMOVE_GPX_TRACK", trackId });
      setOpenTrackId((current) => (current === trackId ? null : current));
      setOpenColorPickerId((current) =>
        current === trackId ? null : current,
      );
    },
    [dispatch],
  );

  const toggleShowAll = useCallback(() => {
    dispatch({
      type: "SET_FIELD",
      name: "showGpxTracks",
      value: !form.showGpxTracks,
    });
  }, [dispatch, form.showGpxTracks]);

  return (
    <section className="panel-block gpx-settings-screen">
      <div className="markers-section-head">
        <p className="section-summary-label">ROUTES</p>
        <div className="markers-section-head-actions">
          <button
            type="button"
            className="marker-row__icon-btn marker-header-action-btn"
            onClick={toggleShowAll}
            title={form.showGpxTracks ? "Hide routes" : "Show routes"}
            disabled={gpxTracks.length === 0}
          >
            <span className="marker-row__icon-btn-label">
              {form.showGpxTracks ? "Hide All" : "Show All"}
            </span>
          </button>
          <button
            type="button"
            className="marker-row__icon-btn marker-header-action-btn"
            onClick={handleUploadClick}
            title="Upload GPX file"
            disabled={isUploading}
          >
            <span className="marker-row__icon-btn-label">
              {isUploading ? "Uploading…" : "Upload GPX"}
            </span>
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        onChange={handleUploadChange}
        style={{ display: "none" }}
      />

      {uploadError ? (
        <p className="gpx-section__error" role="alert">
          {uploadError}
        </p>
      ) : null}

      <div className="gpx-section__content">
        {gpxTracks.length === 0 ? (
          <p className="gpx-section__empty">
            Upload a <code>.gpx</code> file to draw a route on the poster.
            Drawing routes manually is coming soon.
          </p>
        ) : null}

        {gpxTracks.map((track) => {
          const isOpen = openTrackId === track.id;
          const isColorOpen = openColorPickerId === track.id;
          const colorChoices = buildDynamicColorChoices(track.color, palette);
          const pointCount = countTrackPoints(track);

          return (
            <div
              key={track.id}
              className={`gpx-track-card${isOpen ? " is-open" : ""}`}
            >
              <div className="gpx-track-card__row">
                <button
                  type="button"
                  className="gpx-track-card__swatch"
                  style={{ color: track.color, opacity: track.opacity }}
                  onClick={() => {
                    setOpenTrackId(isOpen ? null : track.id);
                    setOpenColorPickerId(null);
                  }}
                  aria-label={`Toggle settings for ${track.label}`}
                />
                <div className="gpx-track-card__meta">
                  <p className="gpx-track-card__label">{track.label}</p>
                  <p className="gpx-track-card__sub">
                    {pointCount.toLocaleString()} point
                    {pointCount === 1 ? "" : "s"}
                    {track.segments.length > 1
                      ? ` · ${track.segments.length} segments`
                      : ""}
                  </p>
                </div>
                <div className="gpx-track-card__actions">
                  <button
                    type="button"
                    className="marker-row__icon-btn"
                    onClick={() =>
                      updateTrack(track.id, { visible: !track.visible })
                    }
                    title={track.visible ? "Hide track" : "Show track"}
                  >
                    <span className="marker-row__icon-btn-label">
                      {track.visible ? "Hide" : "Show"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="marker-row__icon-btn"
                    onClick={() => removeTrack(track.id)}
                    title="Remove track"
                  >
                    <span className="marker-row__icon-btn-icon" aria-hidden="true">
                      <TrashIcon />
                    </span>
                  </button>
                </div>
              </div>

              {isOpen ? (
                <div className="gpx-track-card__body">
                  <div className="gpx-track-card__field">
                    <label>
                      <span>Color</span>
                      <button
                        type="button"
                        className="gpx-track-card__color-toggle"
                        style={{ backgroundColor: track.color }}
                        onClick={() =>
                          setOpenColorPickerId(isColorOpen ? null : track.id)
                        }
                        aria-label={
                          isColorOpen ? "Close color picker" : "Open color picker"
                        }
                      >
                        {isColorOpen ? <CloseIcon /> : null}
                      </button>
                    </label>
                    {isColorOpen ? (
                      <ColorPicker
                        currentColor={track.color}
                        suggestedColors={colorChoices.suggestedColors}
                        moreColors={colorChoices.moreColors}
                        onChange={(color) => updateTrack(track.id, { color })}
                        onResetColor={() =>
                          updateTrack(track.id, {
                            color: state.gpxDefaults.color,
                          })
                        }
                      />
                    ) : null}
                  </div>

                  <div className="gpx-track-card__field">
                    <label htmlFor={`gpx-width-${track.id}`}>
                      <span>Width</span>
                      <span className="gpx-track-card__value">
                        {track.strokeWidth}px
                      </span>
                    </label>
                    <input
                      id={`gpx-width-${track.id}`}
                      type="range"
                      min={MIN_GPX_STROKE_WIDTH}
                      max={MAX_GPX_STROKE_WIDTH}
                      step={1}
                      value={track.strokeWidth}
                      onChange={(event) =>
                        updateTrack(track.id, {
                          strokeWidth: Number(event.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="gpx-track-card__field">
                    <label htmlFor={`gpx-opacity-${track.id}`}>
                      <span>Opacity</span>
                      <span className="gpx-track-card__value">
                        {Math.round(track.opacity * 100)}%
                      </span>
                    </label>
                    <input
                      id={`gpx-opacity-${track.id}`}
                      type="range"
                      min={MIN_GPX_OPACITY}
                      max={MAX_GPX_OPACITY}
                      step={0.05}
                      value={track.opacity}
                      onChange={(event) =>
                        updateTrack(track.id, {
                          opacity: Number(event.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="gpx-track-card__field">
                    <label>
                      <span>Style</span>
                    </label>
                    <div className="gpx-track-card__style-toggle">
                      {GPX_LINE_STYLES.map((style) => (
                        <button
                          key={style}
                          type="button"
                          className={`gpx-track-card__style-btn${track.lineStyle === style ? " is-active" : ""}`}
                          onClick={() =>
                            updateTrack(track.id, { lineStyle: style })
                          }
                        >
                          <span>{style === "solid" ? "Solid" : "Dashed"}</span>
                          <svg
                            className="gpx-track-card__style-preview"
                            width="28"
                            height="8"
                            viewBox="0 0 28 8"
                            aria-hidden="true"
                          >
                            <line
                              x1="1"
                              y1="4"
                              x2="27"
                              y2="4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeDasharray={style === "dashed" ? "4 3" : undefined}
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
