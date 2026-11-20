/**
 * Yellow dot on a nav item for something new; `count` above 1 shows the
 * number. Nothing for 0 / false.
 */
export default function NavDot({ count }: { count?: number | boolean }) {
  const value = typeof count === "number" ? count : count ? 1 : 0;
  if (value <= 0) return null;
  return (
    <span className={`nav-dot${value > 1 ? " nav-dot--count" : ""}`} aria-hidden="true">
      {value > 1 ? value : null}
    </span>
  );
}
