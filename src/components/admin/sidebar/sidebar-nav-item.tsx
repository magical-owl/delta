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
        "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]",
        nested ? "pl-9 text-xs" : "",
        isCollapsed ? "justify-center px-2 py-2.5" : "gap-3",
        active
          ? "bg-[#305B60] text-[#F4F7F6] shadow-sm font-semibold"
          : "text-[#A3B5C0] hover:bg-[#305B60]/40 hover:text-[#F4F7F6]"
      )}
    >
      {/* Active accent indicator bar */}
      {active && (
        <span
          className={cn(
            "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#4B8881]",
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
          active ? "text-[#F4F7F6]" : "text-[#A3B5C0] group-hover:text-[#F4F7F6]"
        )}
      />

      {!isCollapsed && <span className="truncate">{item.title}</span>}

      {!isCollapsed && item.badge && (
        <span className="ml-auto rounded bg-[#305B60] px-2 py-0.5 text-[10px] font-semibold text-[#F4F7F6]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
