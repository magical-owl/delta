import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type IconName =
  | "chart-pie"
  | "users"
  | "folder"
  | "chart-line"
  | "file-lines"
  | "users-gear"
  | "user-shield"
  | "gear"
  | "bell"
  | "bars"
  | "xmark"
  | "chevron-right"
  | "chevron-down"
  | "angle-left"
  | "angle-right"
  | "arrow-left"
  | "screwdriver-wrench"
  | "circle-check"
  | "triangle-exclamation"
  | "shield-halved"
  | "box-archive"
  | "clock"
  | "arrow-trend-up"
  | "arrow-trend-down"
  | "building"
  | "circle-info";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AppIconProps extends React.HTMLAttributes<HTMLElement> {
  name: IconName;
  size?: IconSize;
  srLabel?: string;
}

const sizeClassMap: Record<IconSize, string> = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

/**
 * Reusable icon component utilizing Font Awesome Free Web Fonts (CSS & WebFonts).
 * Strictly forbids inline SVG markup or SVG icon components per design constraints.
 */
export function AppIcon({
  name,
  size = "md",
  className,
  srLabel,
  ...props
}: AppIconProps) {
  const iconElement = (
    <i
      className={cn(
        "fa-solid",
        `fa-${name}`,
        sizeClassMap[size],
        "inline-flex items-center justify-center leading-none",
        className
      )}
      aria-hidden={srLabel ? undefined : "true"}
      {...props}
    />
  );

  if (srLabel) {
    return (
      <span className="inline-flex items-center">
        {iconElement}
        <span className="sr-only">{srLabel}</span>
      </span>
    );
  }

  return iconElement;
}
