export default function RenderStatsSection({ result }) {
  return (
    <section className="info-panel-section">
      <h3>Render Stats</h3>
      {result ? (
        <>
          <p>
            Center: {result.center.lat.toFixed(5)}, {result.center.lon.toFixed(5)}
          </p>
          <p>
            Layers: {result.roads} roads, {result.water} water, {result.parks} parks, {" "}
            {result.buildings} buildings
          </p>
          <p>
            Output: {result.size.width}x{result.size.height}px
            {result.size.downscaleFactor < 1 ? " (downscaled)" : ""}
          </p>
          <p>
            Print size: {result.widthCm.toFixed(1)}x{result.heightCm.toFixed(1)} cm
          </p>
        </>
      ) : (
        <p>No render yet. Use the controls to generate a poster.</p>
      )}
    </section>
  );
}
