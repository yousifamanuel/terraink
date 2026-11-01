import { useEffect, useState } from "react";
import { fetchMarkdownDoc } from "@/core/services";
import { PRIVACY_URL, LEGAL_NOTICE_URL } from "@/core/config";
import type { LegalDocType } from "@/features/legal/application/legalDoc";

const DOC_URLS: Record<LegalDocType, string> = {
  privacy: PRIVACY_URL,
  imprint: LEGAL_NOTICE_URL,
};

interface LegalDocState {
  text: string | null;
  loading: boolean;
  error: boolean;
}

/** Fetch a legal markdown doc on open. Re-fetches whenever `doc` changes. */
export function useLegalDoc(doc: LegalDocType): LegalDocState {
  const [state, setState] = useState<LegalDocState>({
    text: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const url = String(DOC_URLS[doc] ?? "").trim();
    if (!url) {
      setState({ text: null, loading: false, error: true });
      return;
    }

    let cancelled = false;
    setState({ text: null, loading: true, error: false });
    fetchMarkdownDoc(url)
      .then((text) => {
        if (!cancelled) setState({ text, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ text: null, loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [doc]);

  return state;
}
