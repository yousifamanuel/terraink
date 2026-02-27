import type { IHttp } from "./ports";

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 20_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export const fetchAdapter: IHttp = {
  get(
    url: string,
    options: RequestInit = {},
    timeoutMs = 20_000,
  ): Promise<Response> {
    return fetchWithTimeout(url, { ...options, method: "GET" }, timeoutMs);
  },

  post(
    url: string,
    body: string,
    options: RequestInit = {},
    timeoutMs = 20_000,
  ): Promise<Response> {
    return fetchWithTimeout(
      url,
      { ...options, method: "POST", body },
      timeoutMs,
    );
  },
};
