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
        "bg-[#FFFFFF] border-b border-[#DFE6E2]",
        "px-4 sm:px-6 lg:px-8 shadow-xs"
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger (hidden on large screens where sidebar is visible) */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#758481] hover:bg-slate-100 hover:text-[#192E32] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881] lg:hidden"
        >
          <AppIcon name="bars" size="md" />
        </button>

        {/* Page title + subtitle */}
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold leading-tight text-[#192E32]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#758481] leading-tight mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationsPopover />
      </div>
    </header>
  );
}
