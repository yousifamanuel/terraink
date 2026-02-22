export default function ThemePaletteCard({ themePalette, selectedTheme }) {
  return (
    <section className="inspector-card">
      <h3>Theme Palette</h3>
      <div className="swatch-row">
        {themePalette.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="swatch"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <p className="inspector-copy">{selectedTheme.description}</p>
    </section>
  );
}
