import { fetchAdapter } from "@/core/http/fetchAdapter";

/**
 * Fetch a markdown legal document as plain text. No caching — these are
 * opened rarely and must always reflect the latest text in the meta repo.
 */
export async function fetchMarkdownDoc(url: string): Promise<string> {
  const response = await fetchAdapter.get(url);
  if (!response.ok) {
    throw new Error(`Failed to load document (${response.status})`);
  }
  return response.text();
}
