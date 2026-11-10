"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppFormField } from "./app-form-field";

export interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showCount?: boolean;
}

export const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  (
    {
      className,
      id,
      label,
      helperText,
      errorMessage,
      showCount = false,
      maxLength,
      value,
      defaultValue,
      onChange,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState<number>(() => {
      if (typeof value === "string") return value.length;
      if (typeof defaultValue === "string") return defaultValue.length;
      return 0;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <AppFormField
        id={id}
        label={label}
        helperText={helperText}
        errorMessage={errorMessage}
        required={required}
      >
        {({ id: textareaId, describedBy, isInvalid }) => (
          <div className="flex flex-col gap-1 w-full">
            {showCount && maxLength && (
              <div className="flex justify-end">
                <span
                  className={cn(
                    "text-xs text-[var(--text-muted)]",
                    charCount >= maxLength && "text-[var(--color-error)] font-medium"
                  )}
                >
                  {charCount}/{maxLength}
                </span>
              </div>
            )}
            <textarea
              id={textareaId}
              ref={ref}
              rows={rows}
              maxLength={maxLength}
              value={value}
              defaultValue={defaultValue}
              onChange={handleChange}
              disabled={disabled}
              required={required}
              aria-invalid={isInvalid}
              aria-describedby={describedBy}
              className={cn(
                "w-full px-3.5 py-2.5 rounded-lg text-sm transition-colors resize-y",
                "bg-[var(--input-bg)] text-[var(--foreground)]",
                "border border-[var(--input-border)]",
                "placeholder:text-[var(--text-muted)]",
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

AppTextarea.displayName = "AppTextarea";
