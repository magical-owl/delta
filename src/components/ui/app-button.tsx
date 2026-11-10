import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { AppIcon, type IconName } from "./app-icon";

export const appButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-[var(--background)] cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] shadow-xs font-semibold",
        secondary:
          "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)] border border-[var(--border)]",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
        destructive: "bg-[var(--color-error)] text-white hover:opacity-90 shadow-xs",
        ghost: "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
        icon: "h-10 w-10 p-0 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface AppButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appButtonVariants> {
  isLoading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        className={cn(appButtonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={isLoading ? true : undefined}
        {...props}
      >
        {isLoading ? (
          <AppIcon name="spinner" className="animate-spin text-current" />
        ) : leftIcon ? (
          <AppIcon name={leftIcon} />
        ) : null}
        {children}
        {!isLoading && rightIcon ? <AppIcon name={rightIcon} /> : null}
      </button>
    );
  }
);

AppButton.displayName = "AppButton";

export { AppButton as Button };
