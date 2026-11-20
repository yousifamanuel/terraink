import NavDot from "./NavDot";

interface NavTabProps {
  /** Which nav it sits in; picks the class names. */
  variant: "desktop" | "mobile";
  label: string;
  /** Tooltip and screen-reader name when it differs from the label. */
  actionLabel?: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  isActive?: boolean;
  /** Dot for something new; a number above 1 shows the count. */
  dot?: number | boolean;
  /** Extra class, e.g. a modifier like "desktop-nav-tab--news". */
  className?: string;
  ariaCurrent?: "page";
  ariaPressed?: boolean;
}

/** One nav entry (panel tab, News, Settings, …): icon, label and dot. */
export default function NavTab({
  variant,
  label,
  actionLabel,
  Icon,
  onClick,
  isActive = false,
  dot,
  className,
  ariaCurrent,
  ariaPressed,
}: NavTabProps) {
  const classes = [`${variant}-nav-tab`, className, isActive ? "is-active" : ""]
    .filter(Boolean)
    .join(" ");
  const isDesktop = variant === "desktop";
  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      title={isDesktop ? (actionLabel ?? label) : undefined}
      aria-label={isDesktop ? (actionLabel ?? label) : undefined}
      aria-current={ariaCurrent}
      aria-pressed={ariaPressed}
    >
      <span className="nav-icon-wrap">
        <Icon className={`${variant}-nav-icon`} />
        <NavDot count={dot} />
      </span>
      <span className={`${variant}-nav-label`}>{label}</span>
    </button>
  );
}
