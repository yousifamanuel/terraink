import { useState } from "react";
import { usePresets } from "@/features/presets/application/usePresets";
import type { PosterPreset } from "@/features/presets/domain/types";
import { TrashIcon } from "@/shared/ui/Icons";

export default function PresetsSection() {
  const { presets, handleSavePreset, handleLoadPreset, handleDeletePreset } =
    usePresets();
  const [presetName, setPresetName] = useState("");

  const onSave = () => {
    handleSavePreset(presetName || "Untitled");
    setPresetName("");
  };

  return (
    <div className="presets-section">
      <div className="presets-save-row">
        <input
          className="form-control presets-name-input"
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Preset name"
          maxLength={40}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            }
          }}
        />
        <button
          type="button"
          className="presets-save-btn"
          onClick={onSave}
        >
          Save
        </button>
      </div>

      {presets.length > 0 ? (
        <ul className="presets-list">
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onLoad={handleLoadPreset}
              onDelete={handleDeletePreset}
            />
          ))}
        </ul>
      ) : (
        <p className="presets-empty">No saved presets yet.</p>
      )}
    </div>
  );
}

function PresetCard({
  preset,
  onLoad,
  onDelete,
}: {
  preset: PosterPreset;
  onLoad: (preset: PosterPreset) => void;
  onDelete: (id: string) => void;
}) {
  const date = new Date(preset.createdAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const city = preset.form.displayCity || preset.form.location || "—";

  return (
    <li className="presets-card">
      <button
        type="button"
        className="presets-card-main"
        onClick={() => onLoad(preset)}
        title={`Load "${preset.name}"`}
      >
        <span className="presets-card-name">{preset.name}</span>
        <span className="presets-card-meta">
          {city} · {preset.form.theme} · {dateLabel}
        </span>
      </button>
      <button
        type="button"
        className="presets-card-delete"
        onClick={() => onDelete(preset.id)}
        aria-label={`Delete preset "${preset.name}"`}
        title="Delete"
      >
        <TrashIcon />
      </button>
    </li>
  );
}
