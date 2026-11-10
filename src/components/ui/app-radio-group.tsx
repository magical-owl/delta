"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface AppRadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  errorMessage?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const AppRadioGroup: React.FC<AppRadioGroupProps> = ({
  name,
  label,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  errorMessage,
  helperText,
  disabled = false,
  className,
}) => {
  const generatedId = React.useId();
  const [internalValue, setInternalValue] = React.useState<string>(
    controlledValue ?? defaultValue ?? ""
  );

  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (val: string) => {
    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  const errorId = errorMessage ? `${generatedId}-error` : undefined;
  const helperId = helperText ? `${generatedId}-helper` : undefined;

  return (
    <fieldset
      className={cn("flex flex-col gap-2 border-0 p-0 m-0 text-left", className)}
      aria-describedby={[errorId, helperId].filter(Boolean).join(" ") || undefined}
      aria-invalid={Boolean(errorMessage)}
    >
      {label && (
        <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-1">
          {label}
        </legend>
      )}

      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const optionId = `${generatedId}-${option.value}`;
          const isSelected = activeValue === option.value;
          const isOptionDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "relative flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none group",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--color-selected-bg)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]",
                isOptionDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <div className="relative flex items-center justify-center pt-0.5">
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={isOptionDisabled}
                  onChange={() => handleChange(option.value)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                    "border-[var(--input-border)] bg-[var(--surface)]",
                    isSelected && "border-[var(--primary)] bg-[var(--surface)]",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--focus-ring)] peer-focus-visible:ring-offset-1 ring-offset-[var(--background)]"
                  )}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
              </div>

              <div className="flex flex-col text-sm">
                <span
                  className={cn(
                    "font-medium text-[var(--foreground)] transition-colors",
                    isSelected && "text-[var(--primary)]"
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-[var(--text-muted)] mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {errorMessage ? (
        <p
          id={errorId}
          className="text-xs text-[var(--color-error)] flex items-center gap-1 font-medium mt-1"
          role="alert"
        >
          <AppIcon name="circle-exclamation" size="xs" />
          <span>{errorMessage}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[var(--text-muted)] mt-1">
          {helperText}
        </p>
      ) : null}
    </fieldset>
  );
};

AppRadioGroup.displayName = "AppRadioGroup";
