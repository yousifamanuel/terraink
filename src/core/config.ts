/* ────── App config constants ────── */
/* Migrated from src/constants/appConfig.js — env-independent values */

export const CM_PER_INCH = 2.54;

export const MIN_POSTER_CM = 4;
export const MAX_POSTER_CM = 45;
export const DEFAULT_POSTER_WIDTH_CM = 20;
export const DEFAULT_POSTER_HEIGHT_CM = 30;
export const LAYOUT_MATCH_TOLERANCE_CM = 0.01;

export const MIN_DISTANCE_METERS = 1_000;
export const MAX_DISTANCE_METERS = 25_000;
export const DEFAULT_DISTANCE_METERS = 4_000;

export const REPO_URL = import.meta.env.VITE_REPO_URL ?? "";
export const REPO_API_URL = import.meta.env.VITE_REPO_API_URL ?? "";
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? "";
export const LEGAL_NOTICE_URL = import.meta.env.VITE_LEGAL_NOTICE_URL ?? "";
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL ?? "";

export const SOCIAL_LINKEDIN = import.meta.env.VITE_SOCIAL_LINKEDIN ?? "";
export const SOCIAL_INSTAGRAM = import.meta.env.VITE_SOCIAL_INSTAGRAM ?? "";
export const SOCIAL_REDDIT = import.meta.env.VITE_SOCIAL_REDDIT ?? "";
export const SOCIAL_THREADS = import.meta.env.VITE_SOCIAL_THREADS ?? "";
export const SOCIAL_YOUTUBE = import.meta.env.VITE_SOCIAL_YOUTUBE ?? "";
export const APP_CREDIT_URL =
  import.meta.env.VITE_APP_CREDIT_URL ?? "terraink.app";

export interface FontOption {
  value: string;
  label: string;
}

export const FONT_OPTIONS: FontOption[] = [
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
