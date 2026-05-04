import type { UserDefaults } from "../domain/types";

const STORAGE_KEY = "terraink:user-defaults";

function isBrowserStorageAvailable(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

export function loadUserDefaults(): UserDefaults {
  if (!isBrowserStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as UserDefaults;
  } catch {
    return {};
  }
}

export function saveUserDefaults(defaults: UserDefaults): void {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch {
    // ignore quota / serialization issues
  }
}

export function clearUserDefaults(): void {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
