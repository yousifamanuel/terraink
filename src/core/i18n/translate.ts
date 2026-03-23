import { enMessages } from "./messages/en";
import { zhCNMessages } from "./messages/zh-CN";
import { readLocale } from "./storage";
import type { Locale } from "./types";

type MessageParams = Record<string, string | number>;

function formatMessage(
  template: string,
  params?: MessageParams,
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function translateMessage(
  locale: Locale,
  key: string,
  params?: MessageParams,
): string {
  const template =
    locale === "zh-CN"
      ? zhCNMessages[key] ?? enMessages[key] ?? key
      : enMessages[key] ?? key;

  return formatMessage(template, params);
}

export function translateStoredMessage(
  key: string,
  params?: MessageParams,
): string {
  return translateMessage(readLocale(), key, params);
}
