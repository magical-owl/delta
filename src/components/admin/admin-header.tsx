"use client";

import * as React from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "@/hooks/use-sidebar";
import { NotificationsPopover } from "@/components/admin/header/notifications-popover";

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
        "bg-white border-b border-slate-200",
        "px-4 sm:px-6"
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger (hidden on large screens where sidebar is visible) */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
        >
          <AppIcon name="bars" size="md" />
        </button>

        {/* Page title + subtitle */}
        <div className="flex flex-col">
          <h1 className="text-base font-semibold leading-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-400 leading-tight">{subtitle}</p>}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <NotificationsPopover />
      </div>
    </header>
  );
}
