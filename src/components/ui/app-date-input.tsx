"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";
import { AppFormField } from "./app-form-field";

export interface AppDateInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  type?: "date" | "datetime-local";
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const AppDateInput = React.forwardRef<HTMLInputElement, AppDateInputProps>(
  (
    {
      className,
      id,
      label,
      helperText,
      errorMessage,
      type = "date",
      disabled,
      required,
      min,
      max,
      ...props
    },
    ref
  ) => {
    return (
      <AppFormField
        id={id}
        label={label}
        helperText={helperText}
        errorMessage={errorMessage}
        required={required}
      >
        {({ id: inputId, describedBy, isInvalid }) => (
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
              <AppIcon name={type === "date" ? "calendar" : "calendar-days"} size="sm" />
            </span>

            <input
              id={inputId}
              ref={ref}
              type={type}
              disabled={disabled}
              required={required}
              min={min}
              max={max}
              aria-invalid={isInvalid}
              aria-describedby={describedBy}
              className={cn(
                "w-full h-10 pl-10 pr-3.5 rounded-lg text-sm transition-colors",
                "bg-[var(--input-bg)] text-[var(--foreground)]",
                "border border-[var(--input-border)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-[var(--focus-ring)]",
                "disabled:cursor-not-allowed disabled:bg-[var(--color-disabled-bg)] disabled:text-[var(--color-disabled-text)] disabled:border-[var(--border)]",
                isInvalid &&
                  "border-[var(--color-error)] focus-visible:ring-[var(--color-error)]",
                className
              )}
              {...props}
            />
          </div>
        )}
      </AppFormField>
    );
  }
);

AppDateInput.displayName = "AppDateInput";
