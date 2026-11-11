"use client";

import { useTransition } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/dashboard/actions/logout.action";

export interface SidebarLogoutProps {
  isCollapsed?: boolean;
}

/**
 * Sidebar logout button rendered in the bottom section of the sidebar.
 * Uses a Server Action to revoke the session and redirect to /login.
 */
export function SidebarLogout({ isCollapsed = false }: SidebarLogoutProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      aria-label="Sign out"
      title={isCollapsed ? "Sign out" : undefined}
      className={cn(
        "group relative flex w-full min-h-[44px] min-w-[44px] items-center rounded-lg text-sm font-medium transition-colors cursor-pointer select-none",
        "text-[#A3B5C0] hover:bg-[#6B2E2E]/40 hover:text-[#F4F7F6]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]",
        isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
        isPending && "pointer-events-none opacity-60"
      )}
    >
      <AppIcon
        name="right-from-bracket"
        size="sm"
        className="shrink-0 pointer-events-none transition-transform group-hover:scale-110"
      />
      {!isCollapsed && (
        <span className="truncate pointer-events-none font-medium text-sm">
          {isPending ? "Signing out…" : "Sign Out"}
        </span>
      )}
    </button>
  );
}
