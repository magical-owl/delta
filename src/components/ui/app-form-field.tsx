"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";

export interface AppFormFieldProps {
  id?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  className?: string;
  children:
    | React.ReactNode
    | ((props: {
        id: string;
        describedBy?: string;
        isInvalid: boolean;
      }) => React.ReactNode);
}

/**
 * Reusable wrapper for form controls extracting duplicate label, helper text,
 * error notification, and ARIA attribute linking.
 */
export const AppFormField: React.FC<AppFormFieldProps> = ({
  id,
  label,
  helperText,
  errorMessage,
  required = false,
  className,
  children,
}) => {
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;

  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;
  const isInvalid = Boolean(errorMessage);

  return (
    <div className={cn("w-full flex flex-col gap-1.5 text-left", className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]"
        >
          {label}
          {required && (
            <span className="text-[var(--color-error)] ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {typeof children === "function"
        ? children({ id: fieldId, describedBy, isInvalid })
        : children}

      {errorMessage ? (
        <p
          id={errorId}
          className="text-xs text-[var(--color-error)] flex items-center gap-1 font-medium"
          role="alert"
        >
          <AppIcon name="circle-exclamation" size="xs" />
          <span>{errorMessage}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[var(--text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

AppFormField.displayName = "AppFormField";
