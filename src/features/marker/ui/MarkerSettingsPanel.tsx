import type { MarkerStyle } from "../domain/types";
import { MARKER_STYLES } from "../domain/types";
import {
    MIN_MARKER_SIZE,
    MAX_MARKER_SIZE,
    MARKER_SIZE_STEP,
} from "../infrastructure/constants";

interface MarkerSettingsPanelProps {
    showMarker: boolean;
    markerStyle: MarkerStyle;
    markerSize: number;
    markerColor: string;
    onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onStyleChange: (style: MarkerStyle) => void;
    onSizeChange: (size: number) => void;
    onColorChange: (color: string) => void;
}

/**
 * Standalone marker-settings panel.
 *
 * Renders the toggle, style picker, size slider, and color picker
 * for map markers. Designed to be placed as a sibling section
 * alongside LocationSection and MapSettingsSection.
 */
export default function MarkerSettingsPanel({
    showMarker,
    markerStyle,
    markerSize,
    markerColor,
    onToggle,
    onStyleChange,
    onSizeChange,
    onColorChange,
}: MarkerSettingsPanelProps) {
    return (
        <section className="panel-block">
            <h2>Marker</h2>

            <label className="toggle-field">
                <span>Show Marker</span>
                <span className="theme-switch">
                    <input
                        type="checkbox"
                        name="showMarker"
                        checked={showMarker}
                        onChange={onToggle}
                    />
                    <span className="theme-switch-track" aria-hidden="true" />
                </span>
            </label>

            {showMarker && (
                <div className="marker-settings">
                    <div className="marker-style-picker">
                        <span className="marker-style-label">Marker Style</span>
                        <div className="marker-style-options">
                            {MARKER_STYLES.map((ms) => (
                                <button
                                    key={ms.id}
                                    type="button"
                                    className={`marker-style-btn${markerStyle === ms.id ? " is-active" : ""}`}
                                    title={ms.label}
                                    onClick={() => onStyleChange(ms.id)}
                                >
                                    <span className="marker-style-icon">{ms.icon}</span>
                                    <span className="marker-style-name">{ms.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="marker-size-field">
                        <div className="marker-size-header">
                            <span className="marker-style-label">Size</span>
                            <span className="marker-size-value">{markerSize}px</span>
                        </div>
                        <input
                            type="range"
                            className="marker-size-slider"
                            min={MIN_MARKER_SIZE}
                            max={MAX_MARKER_SIZE}
                            step={MARKER_SIZE_STEP}
                            value={markerSize}
                            onChange={(e) => onSizeChange(Number(e.target.value))}
                        />
                    </div>

                    <div className="marker-color-field">
                        <span className="marker-style-label">Color</span>
                        <div className="marker-color-row">
                            <button
                                type="button"
                                className={`marker-color-auto-btn${!markerColor ? " is-active" : ""}`}
                                onClick={() => onColorChange("")}
                            >
                                Auto
                            </button>
                            <div className="marker-color-picker-wrap">
                                <input
                                    type="color"
                                    className="marker-color-input"
                                    value={markerColor || "#ffffff"}
                                    onChange={(e) => onColorChange(e.target.value)}
                                />
                                <span
                                    className="marker-color-swatch"
                                    style={{ backgroundColor: markerColor || undefined }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
