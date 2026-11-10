"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";

export interface AppCheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  description?: string;
  errorMessage?: string;
  indeterminate?: boolean;
}

export const AppCheckbox = React.forwardRef<HTMLInputElement, AppCheckboxProps>(
  (
    {
      className,
      id,
      label,
      description,
      errorMessage,
      indeterminate,
      checked,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    const descId = description ? `${checkboxId}-desc` : undefined;
    const errorId = errorMessage ? `${checkboxId}-error` : undefined;

    const innerRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    return (
      <div className={cn("flex flex-col gap-1 text-left", className)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            "inline-flex items-start gap-2.5 cursor-pointer select-none group",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <div className="relative flex items-center justify-center pt-0.5">
            <input
              id={checkboxId}
              type="checkbox"
              ref={(node) => {
                innerRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              checked={checked}
              disabled={disabled}
              onChange={onChange}
              aria-describedby={[descId, errorId].filter(Boolean).join(" ") || undefined}
              aria-invalid={Boolean(errorMessage)}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                "bg-[var(--surface)] border-[var(--input-border)]",
                "peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)] text-white",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--focus-ring)] peer-focus-visible:ring-offset-1 ring-offset-[var(--background)]",
                "peer-disabled:bg-[var(--color-disabled-bg)] peer-disabled:border-[var(--border)]",
                errorMessage && "border-[var(--color-error)]"
              )}
            >
              {indeterminate ? (
                <span className="w-2 h-0.5 bg-white rounded-xs" />
              ) : checked ? (
                <AppIcon name="check" className="text-[10px]" />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col text-sm">
            {label && (
              <span className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                {label}
              </span>
            )}
            {description && (
              <span id={descId} className="text-xs text-[var(--text-muted)] mt-0.5">
                {description}
              </span>
            )}
          </div>
        </label>

        {errorMessage && (
          <p
            id={errorId}
            className="text-xs text-[var(--color-error)] pl-6 font-medium"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

AppCheckbox.displayName = "AppCheckbox";
