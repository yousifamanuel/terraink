/** At or above this map zoom the poster shows city and country. */
export const COUNTRY_VIEW_ZOOM_LEVEL = 10;
/** At or above this zoom (below the country level): country and continent. */
export const CONTINENT_VIEW_ZOOM_LEVEL = 6;

export interface PosterNameInput {
  city: string;
  country: string;
  continent: string;
  location?: string;
  /** Text the user typed; shown instead of the place names when set. */
  customTitle: string;
  customSubtitle: string;
  /** True once the user typed their own title / subtitle. */
  overrides: { city: boolean; country: boolean };
  zoom: number;
}

export interface PosterNames {
  title: string;
  subtitle: string;
}

/**
 * Title and subtitle printed on the poster. Names the user typed always win;
 * otherwise the names follow the zoom: city / country close up, country /
 * continent further out, continent / Earth for the whole world.
 */
export function resolvePosterNames({
  city,
  country,
  continent,
  location = "",
  customTitle,
  customSubtitle,
  overrides,
  zoom,
}: PosterNameInput): PosterNames {
  let autoTitle: string;
  let autoSubtitle: string;
  if (zoom >= COUNTRY_VIEW_ZOOM_LEVEL) {
    autoTitle = city || location || "Hanover";
    autoSubtitle = country || "Germany";
  } else if (zoom >= CONTINENT_VIEW_ZOOM_LEVEL) {
    autoTitle = country || "Germany";
    autoSubtitle = continent || "Europe";
  } else {
    autoTitle = continent || "Earth";
    autoSubtitle = "Earth";
  }

  return {
    title: overrides.city ? customTitle : autoTitle,
    subtitle: overrides.country ? customSubtitle : autoSubtitle,
  };
}
