import { useState, useEffect, useRef } from "react";
import type { PosterForm } from "@/features/poster/application/posterReducer";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import type { ThemeColorKey } from "@/features/theme/domain/types";
import { getThemeColorByPath } from "@/features/theme/domain/colorPaths";
import ColorPicker from "@/features/theme/ui/ColorPicker";
import MapDimensionFields from "./MapDimensionFields";

interface LayerRow {
  toggleName: keyof PosterForm;
  label: string;
  colorKey: ThemeColorKey;
}

const LAYER_ROWS: LayerRow[] = [
  { toggleName: "includeLandcover", label: "Show landcover", colorKey: "map.landcover" },
  { toggleName: "includeBuildings", label: "Show buildings", colorKey: "map.buildings" },
  { toggleName: "includeWater",     label: "Show water",     colorKey: "map.water"     },
  { toggleName: "includeParks",     label: "Show parks",     colorKey: "map.parks"     },
  { toggleName: "includeRoads",     label: "Show roads",     colorKey: "map.roads.major" },
  { toggleName: "includeRail",      label: "Show rail",      colorKey: "map.rail"      },
  { toggleName: "includeAeroway",   label: "Show aeroway",   colorKey: "map.aeroway"   },
];

interface LayersSectionProps {
  form: PosterForm;
  effectiveTheme: ResolvedTheme;
  customColors: Record<string, string>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onColorChange: (key: ThemeColorKey, value: string) => void;
  onResetColor: (key: ThemeColorKey) => void;
  minPosterCm: number;
  maxPosterCm: number;
  onNumericFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function LayersSection({
  form,
  effectiveTheme,
  customColors,
  onChange,
  onColorChange,
  onResetColor,
  minPosterCm,
  maxPosterCm,
  onNumericFieldBlur,
}: LayersSectionProps) {
  const [openKey, setOpenKey] = useState<ThemeColorKey | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    }
    if (openKey) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openKey]);

  const themeColors = LAYER_ROWS.map((row) =>
    String(getThemeColorByPath(effectiveTheme, row.colorKey) ?? ""),
  );

  return (
    <section className="panel-block" ref={sectionRef}>
      <p className="section-summary-label">LAYERS</p>

      {LAYER_ROWS.map((row, i) => {
        const currentColor = themeColors[i];
        const isOpen = openKey === row.colorKey;
        const isCustom = row.colorKey in customColors;

        return (
          <div key={row.toggleName} className="layer-row">
            <div className="toggle-field layer-toggle-field">
              <span>{row.label}</span>
              <div className="layer-row-controls">
                <button
                  type="button"
                  className={`layer-color-btn${isCustom ? " is-custom" : ""}`}
                  style={{ backgroundColor: currentColor }}
                  onClick={() => setOpenKey(isOpen ? null : row.colorKey)}
                  title={`Change ${row.label.replace("Show ", "")} color`}
                  aria-pressed={isOpen}
                />
                <label className="theme-switch">
                  <input
                    type="checkbox"
                    name={row.toggleName}
                    checked={Boolean(form[row.toggleName])}
                    onChange={onChange}
                  />
                  <span className="theme-switch-track" aria-hidden="true" />
                </label>
              </div>
            </div>

            {isOpen && (
              <div className="layer-color-popover">
                <ColorPicker
                  currentColor={currentColor}
                  suggestedColors={themeColors}
                  onChange={(color) => onColorChange(row.colorKey, color)}
                  onResetColor={() => onResetColor(row.colorKey)}
                  canResetColor={isCustom}
                />
              </div>
            )}
          </div>
        );
      })}

      <div className="map-details-section">
        <h3 className="map-details-subtitle">Map Details</h3>
        <div className="map-details-card">
          <MapDimensionFields
            form={form}
            minPosterCm={minPosterCm}
            maxPosterCm={maxPosterCm}
            onChange={onChange}
            onNumericFieldBlur={onNumericFieldBlur}
            showSizeFields={false}
          />
        </div>
      </div>
    </section>
  );
}
