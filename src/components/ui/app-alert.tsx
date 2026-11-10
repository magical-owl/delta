"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { AppIcon, type IconName } from "./app-icon";

export const appAlertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm transition-colors flex gap-3 text-left",
  {
    variants: {
      variant: {
        info: "bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]",
        success:
          "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
        warning:
          "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]",
        error:
          "bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error-border)]",
        destructive:
          "bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error-border)]",
        default: "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const defaultIconMap: Record<string, IconName> = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "circle-exclamation",
  destructive: "circle-exclamation",
  default: "circle-info",
};

export interface AppAlertProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof appAlertVariants> {
  title?: React.ReactNode;
  icon?: IconName;
  hideIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AppAlert({
  className,
  variant = "info",
  title,
  icon,
  hideIcon = false,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: AppAlertProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) return null;

  const resolvedVariant = variant || "info";
  const resolvedIcon = icon || defaultIconMap[resolvedVariant] || "circle-info";

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={cn(appAlertVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {!hideIcon && (
        <span className="shrink-0 pt-0.5">
          <AppIcon name={resolvedIcon} size="md" />
        </span>
      )}

      <div className="flex-1 flex flex-col gap-1 text-[var(--foreground)]">
        {title && <h5 className="font-semibold text-sm leading-tight">{title}</h5>}
        {children && <div className="text-sm opacity-90 leading-relaxed">{children}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 -mr-1 -mt-1 p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors rounded-md"
          aria-label="Dismiss alert"
        >
          <AppIcon name="xmark" size="sm" />
        </button>
      )}
    </div>
  );
}

export { AppAlert as Alert };
