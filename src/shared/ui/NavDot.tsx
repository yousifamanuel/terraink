/**
 * Yellow dot on a nav item for something new. A number (e.g. new features
 * in a tab) shows inside a slightly larger dot; `true` is a plain dot.
 * Nothing for 0 / false.
 */
export default function NavDot({ count }: { count?: number | boolean }) {
  if (!count) return null;
  const hasNumber = typeof count === "number";
  return (
    <span className={`nav-dot${hasNumber ? " nav-dot--count" : ""}`} aria-hidden="true">
      {hasNumber ? count : null}
    </span>
  );
}
