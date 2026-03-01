export default function FooterNote() {
  return (
    <footer className="app-footer">
      <p className="source-note">
        Map data &copy;{" "}
        <a
          className="source-link"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap contributors
        </a>
        {" | "}Tiles &copy;{" "}
        <a
          className="source-link"
          href="https://openmaptiles.org/"
          target="_blank"
          rel="noreferrer"
        >
          OpenMapTiles
        </a>
        {" | "}Powered by{" "}
        <a
          className="source-link"
          href="https://openfreemap.org/"
          target="_blank"
          rel="noreferrer"
        >
          OpenFreeMap
        </a>
        ,{" "}
        <a
          className="source-link"
          href="https://nominatim.openstreetmap.org/"
          target="_blank"
          rel="noreferrer"
        >
          Nominatim
        </a>{" "}
        &amp;{" "}
        <a
          className="source-link"
          href="https://maplibre.org/"
          target="_blank"
          rel="noreferrer"
        >
          MapLibre
        </a>
        .
      </p>
      <p className="made-note">
        Made with <span className="heart">❤︎</span> in Hannover, Germany
      </p>
    </footer>
  );
}
