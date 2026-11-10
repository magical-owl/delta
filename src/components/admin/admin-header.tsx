"use client";

import * as React from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "@/hooks/use-sidebar";
import { NotificationsPopover } from "@/components/admin/header/notifications-popover";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { toggleMobile } = useSidebar();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center justify-between",
        "bg-[var(--surface)] border-b border-[var(--border)]",
        "px-4 sm:px-6 lg:px-8 shadow-xs transition-colors duration-150"
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger (hidden on large screens where sidebar is visible) */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:hidden"
        >
          <AppIcon name="bars" size="md" />
        </button>

        {/* Page title + subtitle */}
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold leading-tight text-[var(--foreground)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsPopover />
      </div>
    </header>
  );
}
