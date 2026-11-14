import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/core/i18n";
import { SUPPORTED_LANGUAGES } from "@/core/i18n/languages";
import { CheckIcon, LanguageIcon } from "@/shared/ui/Icons";

/** Desktop header shortcut for the language picker (also in Settings). */
export default function LanguageMenu() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = i18n.language ?? "en";
  const label = t("settings.section.language");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="language-menu" ref={rootRef}>
      <button
        type="button"
        className="general-header-social-btn language-menu-trigger"
        aria-label={label}
        title={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <LanguageIcon />
        <span className="language-menu-code">{current.slice(0, 2)}</span>
      </button>
      {open ? (
        <ul className="language-menu-list" role="listbox" aria-label={label}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === current}
                className={`language-menu-option${lang.code === current ? " is-active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  void changeLanguage(lang.code);
                }}
              >
                <span lang={lang.code}>{lang.label}</span>
                {lang.code === current ? <CheckIcon aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
