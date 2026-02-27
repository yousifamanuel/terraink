export default function FooterNote() {
  return (
    <footer className="app-footer">
      <p className="source-note">
        Map search and cartographic data are powered by{" "}
        <a
          className="source-link"
          href="https://nominatim.openstreetmap.org/"
          target="_blank"
          rel="noreferrer"
        >
          Nominatim
        </a>
        ,{" "}
        <a
          className="source-link"
          href="https://overpass-api.de/"
          target="_blank"
          rel="noreferrer"
        >
          Overpass API
        </a>
        , and{" "}
        <a
          className="source-link"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap contributors
        </a>
        .
      </p>
      <p className="made-note">
        Made with <span className="heart">❤︎</span> in Hannover, Germany
      </p>
    </footer>
  );
}
