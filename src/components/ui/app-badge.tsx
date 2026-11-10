import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { AppIcon, type IconName } from "./app-icon";

export const appBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)]",
        primary:
          "bg-[var(--color-selected-bg)] text-[var(--primary)] border border-[var(--primary)] font-semibold",
        success:
          "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]",
        warning:
          "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
        error:
          "bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]",
        destructive:
          "bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]",
        info: "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info-border)]",
        outline: "border border-[var(--border)] text-[var(--foreground)] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AppBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof appBadgeVariants> {
  leftIcon?: IconName;
}

export function AppBadge({
  className,
  variant,
  leftIcon,
  children,
  ...props
}: AppBadgeProps) {
  return (
    <div className={cn(appBadgeVariants({ variant }), className)} {...props}>
      {leftIcon && <AppIcon name={leftIcon} size="xs" />}
      <span>{children}</span>
    </div>
  );
}

export { AppBadge as Badge };
