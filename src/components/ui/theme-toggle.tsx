"use client";

import * as React from "react";
import { useTheme } from "@/lib/theme/theme-context";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";

export interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

/**
 * Accessible theme switcher button using Font Awesome webfonts.
 * Seamlessly transitions between light and dark themes with persistent storage.
 */
export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center justify-center rounded-lg transition-colors",
        "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        className
      )}
    >
      <AppIcon
        name={isDark ? "sun" : "moon"}
        size={size === "sm" ? "sm" : "md"}
        className="transition-transform duration-200"
      />
    </button>
  );
}
