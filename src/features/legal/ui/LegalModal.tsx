import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";
import { CloseIcon } from "@/shared/ui/Icons";
import { useLegalDoc } from "@/features/legal/application/useLegalDoc";
import type { LegalDocType } from "@/features/legal/application/legalDoc";

const TITLES: Record<LegalDocType, string> = {
  privacy: "Privacy Policy",
  imprint: "Imprint",
};

interface LegalModalProps {
  doc: LegalDocType;
  onClose: () => void;
}

export default function LegalModal({ doc, onClose }: LegalModalProps) {
  const { text, loading, error } = useLegalDoc(doc);

  return createPortal(
    <div className="picker-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="picker-modal legal-modal"
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[doc]}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="legal-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        <div className="legal-modal__body">
          {loading && <p className="legal-modal__status">Loading…</p>}
          {error && (
            <p className="legal-modal__status">
              Couldn't load this document — please try again later.
            </p>
          )}
          {text && (
            <div className="legal-modal__content">
              <ReactMarkdown
                remarkPlugins={[remarkBreaks]}
                rehypePlugins={[rehypeSanitize]}
              >
                {text}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
