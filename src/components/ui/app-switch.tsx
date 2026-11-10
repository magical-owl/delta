"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AppSwitchProps {
  id?: string;
  label?: React.ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export const AppSwitch: React.FC<AppSwitchProps> = ({
  id,
  label,
  description,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;
  const descId = description ? `${switchId}-desc` : undefined;

  const [internalChecked, setInternalChecked] = React.useState<boolean>(
    controlledChecked ?? defaultChecked
  );

  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const nextVal = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(nextVal);
    }
    onChange?.(nextVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 py-1 text-left",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col select-none">
          {label && (
            <label
              htmlFor={switchId}
              onClick={handleToggle}
              className={cn(
                "text-sm font-medium text-[var(--foreground)] cursor-pointer",
                disabled && "cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span id={descId} className="text-xs text-[var(--text-muted)] mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
        aria-describedby={descId}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 ring-offset-[var(--background)]",
          isChecked ? "bg-[var(--primary)]" : "bg-[var(--input-border)]",
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
};

AppSwitch.displayName = "AppSwitch";
