import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AppProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null;
  max?: number;
  variant?: "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const variantStyles = {
  primary: "bg-[var(--primary)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-[var(--color-error)]",
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function AppProgress({
  value = 0,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  className,
  ...props
}: AppProgressProps) {
  const isIndeterminate = value === null || value === undefined;
  const percentage = isIndeterminate
    ? undefined
    : Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)} {...props}>
      {showLabel && !isIndeterminate && (
        <div className="flex justify-between items-center text-xs font-medium text-[var(--text-muted)]">
          <span>Progress</span>
          <span className="font-mono text-[var(--foreground)]">{percentage}%</span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "w-full rounded-full bg-[var(--surface-muted)] border border-[var(--border)] overflow-hidden",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-in-out",
            variantStyles[variant],
            isIndeterminate && "w-1/3 animate-pulse"
          )}
          style={{ width: isIndeterminate ? undefined : `${percentage}%` }}
        />
      </div>
    </div>
  );
}

AppProgress.displayName = "AppProgress";
