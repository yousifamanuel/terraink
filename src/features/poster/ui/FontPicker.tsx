import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ensureFont } from "@/core/services";
import { posterTitleWeight } from "@/core/fonts";
import type { FontOption } from "@/core/config";
import { ChevronDownIcon } from "@/shared/ui/Icons";

interface FontPickerProps {
  value: string;
  options: FontOption[];
  onSelect: (family: string) => void;
  /** Theme colors, so the list previews the poster look. */
  backgroundColor: string;
  textColor: string;
}

const DEFAULT_FAMILY = "Space Grotesk";

// Single-weight display faces stay regular; a faked bold fills them in.
const fontWeight = (family: string) =>
  posterTitleWeight(family) === 400 ? 400 : undefined;

const fontStack = (family: string) =>
  `"${family || DEFAULT_FAMILY}", "${DEFAULT_FAMILY}", sans-serif`;

/**
 * Font dropdown: closed until clicked, then every font is listed at once,
 * each name written in its own font on the theme's colors. The fonts are
 * loaded only when the list is first opened.
 */
export default function FontPicker({
  value,
  options,
  onSelect,
  backgroundColor,
  textColor,
}: FontPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  // The list scrolls inside a fixed height; a fade marks that more follows.
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const [hasMoreAbove, setHasMoreAbove] = useState(false);
  const updateHasMore = () => {
    const list = listRef.current;
    if (!list) return;
    setHasMoreBelow(list.scrollTop + list.clientHeight < list.scrollHeight - 2);
    setHasMoreAbove(list.scrollTop > 2);
  };
  const scrollList = (direction: 1 | -1) =>
    listRef.current?.scrollBy({
      top: direction * listRef.current.clientHeight * 0.7,
      behavior: "smooth",
    });
  useEffect(() => {
    if (!isOpen) return;
    // Once laid out: show the current font, then check what's below.
    const frameId = window.requestAnimationFrame(() => {
      const list = listRef.current;
      const selected = list?.querySelector<HTMLElement>(
        ".font-picker-option.is-selected",
      );
      if (list && selected)
        list.scrollTop = selected.offsetTop - list.clientHeight / 2;
      updateHasMore();
      // Bring the whole open list into view inside the panel.
      list?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);
  const fontsRequested = useRef(false);

  const labelFor = (family: string) =>
    family
      ? (options.find((option) => option.value === family)?.label ?? family)
      : t("poster.typography.defaultFont");

  // Load every family the first time the list opens (not on page load).
  useEffect(() => {
    if (!isOpen || fontsRequested.current) return;
    fontsRequested.current = true;
    const families = options
      .map((option) => String(option.value || "").trim())
      .filter(Boolean);
    void Promise.allSettled(families.map((family) => ensureFont(family)));
  }, [isOpen, options]);

  // Close on a click outside or on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const current = value.trim();

  return (
    <div ref={rootRef} className="font-picker">
      <button
        type="button"
        className="font-picker-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t("poster.typography.font")}: ${labelFor(current)}`}
        style={{
          backgroundColor,
          color: textColor,
          fontFamily: fontStack(current),
          fontWeight: fontWeight(current),
        }}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{labelFor(current)}</span>
        <ChevronDownIcon
          className={`font-picker-chevron${isOpen ? " is-open" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          className="font-picker-list-wrap"
          style={
            {
              color: textColor,
              "--font-list-bg": backgroundColor,
            } as CSSProperties
          }
        >
          <div
            ref={listRef}
            className="font-picker-list"
            onScroll={updateHasMore}
            role="listbox"
            aria-label={t("poster.typography.font")}
            style={{ backgroundColor, color: textColor }}
          >
            {options.map((option) => {
              const family = String(option.value || "").trim();
              const isSelected = family === current;
              return (
                <button
                  key={family || "default"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`font-picker-option${isSelected ? " is-selected" : ""}`}
                  style={{
                    fontFamily: fontStack(family),
                    fontWeight: fontWeight(family),
                  }}
                  onClick={() => {
                    onSelect(family);
                    setIsOpen(false);
                  }}
                >
                  {labelFor(family)}
                </button>
              );
            })}
          </div>
          {/* The faded ends of the list scroll it on when clicked; wheel,
              touch and keys work as well. */}
          {hasMoreAbove ? (
            <button
              type="button"
              className="font-picker-more font-picker-more--up"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => scrollList(-1)}
            >
              <span className="font-picker-more-arrow">
                <ChevronDownIcon />
              </span>
            </button>
          ) : null}
          {hasMoreBelow ? (
            <button
              type="button"
              className="font-picker-more"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => scrollList(1)}
            >
              <span className="font-picker-more-arrow">
                <ChevronDownIcon />
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
