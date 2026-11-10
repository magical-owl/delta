"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon, type IconName } from "./app-icon";
import { AppFormField } from "./app-form-field";

export interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  showPasswordToggle?: boolean;
}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      className,
      id,
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      type = "text",
      showPasswordToggle = false,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const isPasswordType = type === "password";
    const resolvedType =
      isPasswordType && showPasswordToggle
        ? isPasswordVisible
          ? "text"
          : "password"
        : type;

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
            {leftIcon && (
              <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
                <AppIcon name={leftIcon} size="sm" />
              </span>
            )}

            <input
              id={inputId}
              ref={ref}
              type={resolvedType}
              disabled={disabled}
              required={required}
              aria-invalid={isInvalid}
              aria-describedby={describedBy}
              className={cn(
                "w-full h-10 px-3.5 rounded-lg text-sm transition-colors",
                "bg-[var(--input-bg)] text-[var(--foreground)]",
                "border border-[var(--input-border)]",
                "placeholder:text-[var(--text-muted)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-[var(--focus-ring)]",
                "disabled:cursor-not-allowed disabled:bg-[var(--color-disabled-bg)] disabled:text-[var(--color-disabled-text)] disabled:border-[var(--border)]",
                isInvalid &&
                  "border-[var(--color-error)] focus-visible:ring-[var(--color-error)]",
                leftIcon && "pl-10",
                (rightIcon || (isPasswordType && showPasswordToggle)) && "pr-10",
                className
              )}
              {...props}
            />

            {isPasswordType && showPasswordToggle ? (
              <button
                type="button"
                onClick={() => setIsPasswordVisible((v) => !v)}
                className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors p-1"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                <AppIcon name={isPasswordVisible ? "eye-slash" : "eye"} size="sm" />
              </button>
            ) : rightIcon ? (
              <span className="absolute right-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
                <AppIcon name={rightIcon} size="sm" />
              </span>
            ) : null}
          </div>
        )}
      </AppFormField>
    );
  }
);

AppInput.displayName = "AppInput";
export { AppInput as Input };
