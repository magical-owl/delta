"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { NavGroupConfig } from "@/config/navigation";
import { isActiveRoute } from "@/lib/navigation/active-route";
import { SidebarNavItem } from "@/components/admin/sidebar/sidebar-nav-item";
import { cn } from "@/lib/utils/cn";

export interface SidebarNavGroupProps {
  group: NavGroupConfig;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavGroup({
  group,
  isCollapsed,
  onNavigate,
}: SidebarNavGroupProps) {
  const pathname = usePathname() || "";

  const hasActiveChild = group.items.some((item) =>
    isActiveRoute(pathname, item.href, item.exactMatch)
  );

  const [isExpanded, setIsExpanded] = React.useState<boolean>(hasActiveChild);

  // When sidebar is collapsed, render items directly without group heading
  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-1">
        {group.items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
            nested={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Full-row clickable group toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-label={
          isExpanded
            ? `Collapse ${group.groupTitle} group`
            : `Expand ${group.groupTitle} group`
        }
        aria-expanded={isExpanded}
        className={cn(
          "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[#A3B5C0] select-none transition-colors cursor-pointer",
          "hover:bg-[#305B60]/40 hover:text-[#F4F7F6]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 pointer-events-none">
          <AppIcon
            name={group.icon}
            size="xs"
            className="shrink-0 text-[#A3B5C0] transition-colors group-hover:text-[#F4F7F6]"
          />
          <span className="truncate">{group.groupTitle}</span>
        </div>
        <AppIcon
          name={isExpanded ? "chevron-down" : "chevron-right"}
          size="xs"
          className="shrink-0 text-[#A3B5C0] transition-transform group-hover:text-[#F4F7F6] pointer-events-none"
        />
      </button>

      {/* Collapsible children */}
      {isExpanded && (
        <div className="flex flex-col gap-1 transition-all duration-200 motion-reduce:transition-none">
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isCollapsed={false}
              onNavigate={onNavigate}
              nested={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
