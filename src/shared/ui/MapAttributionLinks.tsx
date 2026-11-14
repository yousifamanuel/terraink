import { useTranslation } from "react-i18next";

/**
 * The tiles/data attribution links, shared by the inline mobile footer and the
 * desktop attribution modal so the text lives in one place.
 */
export default function MapAttributionLinks() {
  const { t } = useTranslation();
  return (
    <>
      {t("shell.attribution.tiles")}{" "}
      <a
        className="source-link"
        href="https://openmaptiles.org/"
        target="_blank"
        rel="noreferrer"
      >
        OpenMapTiles
      </a>
      {" | "}{t("shell.attribution.poweredBy")}{" "}
      <a
        className="source-link"
        href="https://openfreemap.org/"
        target="_blank"
        rel="noreferrer"
      >
        OpenFreeMap
      </a>
      {", "}
      <a
        className="source-link"
        href="https://nominatim.openstreetmap.org/"
        target="_blank"
        rel="noreferrer"
      >
        Nominatim
      </a>
      {" "}{t("shell.attribution.and")}{" "}
      <a
        className="source-link"
        href="https://maplibre.org/"
        target="_blank"
        rel="noreferrer"
      >
        MapLibre
      </a>
      .
    </>
  );
}
