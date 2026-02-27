import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function BaseIcon({
  viewBox = "0 0 16 16",
  size,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.7 7.7 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </BaseIcon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        fill="currentColor"
        d="M8 .2 10.06 5l5.2.42-3.95 3.4 1.18 5.05L8 11.2 3.51 13.87l1.18-5.05L.74 5.42 5.94 5 8 .2z"
      />
    </BaseIcon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 2v7m0 0L5.3 6.6M8 9l2.7-2.4M3 11.6h10" />
    </BaseIcon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 24 24" {...props}>
      <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.79z" />
    </BaseIcon>
  );
}
