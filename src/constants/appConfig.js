import { defaultThemeName } from "../lib/themes";

export const CM_PER_INCH = 2.54;
export const DEFAULT_POSTER_WIDTH_CM = 20;
export const DEFAULT_POSTER_HEIGHT_CM = 30;
export const MIN_POSTER_CM = 5;
export const MAX_POSTER_CM = 60;

export const REPO_URL = import.meta.env.VITE_REPO_URL;
export const REPO_API_URL = import.meta.env.VITE_REPO_API_URL;
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
export const LEGAL_NOTICE_URL = import.meta.env.VITE_LEGAL_NOTICE_URL;
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL;

export const DEFAULT_FORM = {
  location: "Hanover, Germany",
  latitude: "",
  longitude: "",
  distance: "4000",
  width: String(DEFAULT_POSTER_WIDTH_CM),
  height: String(DEFAULT_POSTER_HEIGHT_CM),
  theme: defaultThemeName,
  displayCity: "",
  displayCountry: "",
  fontFamily: "",
};

export const FONT_OPTIONS = [
  { value: "", label: "Default (Space Grotesk)" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Oswald", label: "Oswald" },
  { value: "Noto Sans JP", label: "Noto Sans JP" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Raleway", label: "Raleway" },
  { value: "Lato", label: "Lato" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Bebas neue", label: "Bebas Neue" },
];
