import { useTranslation } from "react-i18next";
import type { ThemeColorKey } from "../domain/types";

export interface ColorTarget {
  key: ThemeColorKey;
  label: string;
  color: string;
  isActive: boolean;
  /** Its map layer is switched off, so changing it shows nothing now. */
  isOff?: boolean;
}

export interface ColorTargetGroup {
  id: string;
  label: string;
  targets: ColorTarget[];
}

interface ThemeColorEditorProps {
  activeColorLabel: string;
  hasCustomColors: boolean;
  onResetAllColors: () => void;
  onSave: () => void;
  onDone: () => void;
  /** One group per section; a single unlabeled group when not grouped. */
  colorGroups: ColorTargetGroup[];
  onTargetSelect: (key: ThemeColorKey) => void;
  groupColors: boolean;
  showDetails: boolean;
  onGroupColorsChange: (value: boolean) => void;
  onShowDetailsChange: (value: boolean) => void;
}

export default function ThemeColorEditor({
  activeColorLabel,
  hasCustomColors,
  onResetAllColors,
  onSave,
  onDone,
  colorGroups,
  onTargetSelect,
  groupColors,
  showDetails,
  onGroupColorsChange,
  onShowDetailsChange,
}: ThemeColorEditorProps) {
  const { t } = useTranslation();
  return (
    <section className="panel-block color-editor-screen">
      <h2>{t("theme.editor.title")}</h2>

      <div className="color-editor-header">
        <p className="theme-active-label">{t("theme.editor.editing", { label: activeColorLabel })}</p>
        <div className="theme-edit-actions">
          <button
            type="button"
            className="theme-save-btn"
            onClick={onSave}
          >
            {t("theme.editor.save")}
          </button>
          <button
            type="button"
            className="theme-reset-all-btn"
            onClick={onResetAllColors}
            disabled={!hasCustomColors}
          >
            {t("theme.editor.resetAll")}
          </button>
          <button
            type="button"
            className="theme-edit-done-btn"
            onClick={onDone}
          >
            {t("theme.editor.done")}
          </button>
        </div>
      </div>

      <div className="color-editor-toggles">
        <label className="toggle-field">
          <span>{t("theme.editor.groupColors")}</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              checked={groupColors}
              onChange={(event) => onGroupColorsChange(event.target.checked)}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>
        <label className="toggle-field">
          <span>{t("theme.editor.showDetails")}</span>
          <span className="theme-switch">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(event) => onShowDetailsChange(event.target.checked)}
            />
            <span className="theme-switch-track" aria-hidden="true" />
          </span>
        </label>
      </div>

      {colorGroups.map((group) => (
        <div key={group.id} className="color-editor-group">
          {group.label ? (
            <h3 className="color-editor-group-title">{group.label}</h3>
          ) : null}
          <div className="color-editor-target-grid">
            {group.targets.map((target) => (
              <button
                key={target.key}
                type="button"
                className={`color-editor-target${target.isActive ? " is-active" : ""}${target.isOff ? " is-off" : ""}`}
                onClick={() => onTargetSelect(target.key)}
                aria-pressed={target.isActive}
                aria-label={`${target.label}: ${target.color}${target.isOff ? ` (${t("theme.editor.layerOff")})` : ""}`}
                title={target.isOff ? t("theme.editor.layerOff") : undefined}
              >
                <span
                  className="color-editor-target-swatch"
                  style={{ backgroundColor: target.color }}
                />
                {target.isOff ? (
                  <span className="color-editor-target-off" aria-hidden="true">
                    {t("theme.editor.off")}
                  </span>
                ) : null}
                <span className="color-editor-target-name">{target.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
