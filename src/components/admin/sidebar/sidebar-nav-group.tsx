"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { NavGroupConfig } from "@/config/navigation";
import { isActiveRoute } from "@/lib/navigation/active-route";
import { SidebarNavItem } from "@/components/admin/sidebar/sidebar-nav-item";

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
      <div className="flex flex-col gap-0.5">
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
    <div className="flex flex-col gap-0.5">
      {/* Group heading row */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 select-none">
          <AppIcon name={group.icon} size="xs" className="shrink-0 text-slate-500" />
          <span className="truncate">{group.groupTitle}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={
            isExpanded
              ? `Collapse ${group.groupTitle} group`
              : `Expand ${group.groupTitle} group`
          }
          aria-expanded={isExpanded}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <AppIcon name={isExpanded ? "chevron-down" : "chevron-right"} size="xs" />
        </button>
      </div>

      {/* Collapsible children */}
      {isExpanded && (
        <div className="flex flex-col gap-0.5 transition-all duration-200 motion-reduce:transition-none">
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
