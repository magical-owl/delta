"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { routeTitleMap } from "@/config/navigation";
import { Sidebar } from "@/components/admin/sidebar/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminFooter } from "@/components/admin/admin-footer";

interface AdminShellProps {
  children: React.ReactNode;
}

function AdminShell({ children }: AdminShellProps) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname() || "";

  const routeMeta = routeTitleMap[pathname] ?? {
    title: "Dashboard",
    subtitle: undefined,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F2] text-[#192E32]">
      {/* Fixed left sidebar (also handles mobile drawer) */}
      <Sidebar />

      {/* Right content column — offset to avoid fixed sidebar on desktop */}
      <div
        className="admin-workspace flex flex-1 flex-col overflow-hidden min-w-0 transition-all duration-300 ease-in-out motion-reduce:transition-none"
        style={
          {
            "--workspace-sidebar-width": isCollapsed ? "72px" : "256px",
          } as React.CSSProperties
        }
      >
        <AdminHeader title={routeMeta.title} subtitle={routeMeta.subtitle} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-[#F4F5F2] p-4 sm:p-6 lg:p-8"
          tabIndex={-1}
        >
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}

export interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Top-level admin layout shell. Wraps everything in SidebarProvider so that
 * all nested components can access sidebar state via useSidebar().
 */
export function AdminLayoutClient({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#4B8881] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#386E69]"
      >
        Skip to main content
      </a>

      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}
