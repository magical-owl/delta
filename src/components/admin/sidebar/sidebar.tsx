"use client";

import * as React from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarBrand } from "@/components/admin/sidebar/sidebar-brand";
import { SidebarNavigation } from "@/components/admin/sidebar/sidebar-navigation";
import { SidebarToggle } from "@/components/admin/sidebar/sidebar-toggle";

export function Sidebar() {
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col",
          "bg-[#172632] text-[#F4F7F6] border-r border-[#192E32]",
          "transition-all duration-300 ease-in-out motion-reduce:transition-none",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Brand */}
        <SidebarBrand isCollapsed={isCollapsed} />

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
          <SidebarNavigation isCollapsed={isCollapsed} />
        </div>

        {/* Bottom toggle section */}
        <div className="border-t border-[#192E32]/80 p-3">
          <SidebarToggle
            isCollapsed={isCollapsed}
            onToggle={toggleCollapsed}
            sidebarId="admin-sidebar"
          />
        </div>
      </aside>

      {/* ── Mobile overlay + drawer ── */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-[#172632]/60 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#172632] text-[#F4F7F6] shadow-2xl lg:hidden"
          >
            {/* Drawer header with close button */}
            <div className="flex items-center justify-between border-b border-[#192E32]/80 pr-3">
              <SidebarBrand isCollapsed={false} />
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close navigation"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#A3B5C0] hover:bg-[#305B60]/50 hover:text-[#F4F7F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]"
              >
                <AppIcon name="xmark" size="sm" />
              </button>
            </div>

            {/* Scrollable nav */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
              <SidebarNavigation isCollapsed={false} onNavigate={closeMobile} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
