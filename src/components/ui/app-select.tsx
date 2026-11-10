"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";
import { AppFormField } from "./app-form-field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const AppSelect = React.forwardRef<HTMLSelectElement, AppSelectProps>(
  (
    {
      className,
      id,
      label,
      helperText,
      errorMessage,
      options,
      placeholder,
      disabled,
      required,
      children,
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
        {({ id: selectId, describedBy, isInvalid }) => (
          <div className="relative flex items-center">
            <select
              id={selectId}
              ref={ref}
              disabled={disabled}
              required={required}
              aria-invalid={isInvalid}
              aria-describedby={describedBy}
              className={cn(
                "w-full h-10 pl-3.5 pr-10 rounded-lg text-sm appearance-none cursor-pointer transition-colors",
                "bg-[var(--input-bg)] text-[var(--foreground)]",
                "border border-[var(--input-border)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-[var(--focus-ring)]",
                "disabled:cursor-not-allowed disabled:bg-[var(--color-disabled-bg)] disabled:text-[var(--color-disabled-text)] disabled:border-[var(--border)]",
                isInvalid &&
                  "border-[var(--color-error)] focus-visible:ring-[var(--color-error)]",
                className
              )}
              {...props}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {options
                ? options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </option>
                  ))
                : children}
            </select>

            <span className="absolute right-3.5 pointer-events-none text-[var(--text-muted)] flex items-center">
              <AppIcon name="chevron-down" size="xs" />
            </span>
          </div>
        )}
      </AppFormField>
    );
  }
);

AppSelect.displayName = "AppSelect";
