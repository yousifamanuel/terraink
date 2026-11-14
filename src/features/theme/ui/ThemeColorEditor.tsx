import { useTranslation } from "react-i18next";
import type { ThemeColorKey } from "../domain/types";

interface ColorTarget {
  key: ThemeColorKey;
  label: string;
  color: string;
  isActive: boolean;
}

interface ThemeColorEditorProps {
  activeColorLabel: string;
  hasCustomColors: boolean;
  onResetAllColors: () => void;
  onSave: () => void;
  onDone: () => void;
  colorTargets: ColorTarget[];
  onTargetSelect: (key: ThemeColorKey) => void;
}

export default function ThemeColorEditor({
  activeColorLabel,
  hasCustomColors,
  onResetAllColors,
  onSave,
  onDone,
  colorTargets,
  onTargetSelect,
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

      <div className="color-editor-target-grid">
        {colorTargets.map((target) => (
          <button
            key={target.key}
            type="button"
            className={`color-editor-target${target.isActive ? " is-active" : ""}`}
            onClick={() => onTargetSelect(target.key)}
            aria-pressed={target.isActive}
            aria-label={`${target.label}: ${target.color}`}
          >
            <span
              className="color-editor-target-swatch"
              style={{ backgroundColor: target.color }}
            />
            <span className="color-editor-target-name">{target.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
