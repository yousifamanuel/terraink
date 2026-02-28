/* Types for the Install Prompt feature */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const INSTALL_DISMISS_KEY = "install-dismissed";
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
