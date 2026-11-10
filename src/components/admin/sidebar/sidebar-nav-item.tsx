"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { NavItemConfig } from "@/config/navigation";
import { isActiveRoute } from "@/lib/navigation/active-route";
import { cn } from "@/lib/utils/cn";

export interface SidebarNavItemProps {
  item: NavItemConfig;
  isCollapsed?: boolean;
  onNavigate?: () => void;
  nested?: boolean;
}

export function SidebarNavItem({
  item,
  isCollapsed = false,
  onNavigate,
  nested = false,
}: SidebarNavItemProps) {
  const pathname = usePathname() || "";
  const active = isActiveRoute(pathname, item.href, item.exactMatch);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={isCollapsed ? item.title : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        nested ? "pl-9 text-xs" : "",
        isCollapsed ? "justify-center px-2 py-2.5" : "gap-3",
        active
          ? "bg-slate-800/90 text-teal-300 shadow-sm"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      )}
    >
      {/* Active accent indicator bar */}
      {active && (
        <span
          className={cn(
            "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-teal-500",
            nested ? "left-6" : "left-0"
          )}
          aria-hidden="true"
        />
      )}

      <AppIcon
        name={item.icon}
        size={nested ? "xs" : "sm"}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"
        )}
      />

      {!isCollapsed && <span className="truncate">{item.title}</span>}

      {!isCollapsed && item.badge && (
        <span className="ml-auto rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
