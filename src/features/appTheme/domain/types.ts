/**
 * An app theme sets the look of the app itself (not the poster): its main
 * colors, plus optionally its own logo and a font for the app name. Any map
 * theme can offer one through an "app" section in its JSON. Without one, the
 * app keeps the look its stylesheets hold.
 */
export interface AppThemeSpec {
  id: string;
  /** Background color; the app's colors are shifted toward it. */
  bg: string;
  /** Logo URL; unset = the standard logo. */
  logo?: string;
  /** Font family for the app name; unset = the standard face. */
  titleFont?: string;
  /** Accent color the app's greens shift toward; unset = the app's own. */
  accent?: string;
  /** Color the app's light text and icons shift toward; unset = with the background. */
  text?: string;
}

export const STANDARD_LOGO = "/assets/logo.svg";
