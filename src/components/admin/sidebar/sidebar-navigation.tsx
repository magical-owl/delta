import { adminNavigation, isNavGroup } from "@/config/navigation";
import { SidebarNavGroup } from "@/components/admin/sidebar/sidebar-nav-group";
import { SidebarNavItem } from "@/components/admin/sidebar/sidebar-nav-item";

export interface SidebarNavigationProps {
  isCollapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavigation({ isCollapsed, onNavigate }: SidebarNavigationProps) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 px-2 py-3">
      {adminNavigation.map((entry, index) => {
        if (isNavGroup(entry)) {
          return (
            <SidebarNavGroup
              key={`group-${entry.groupTitle}-${index}`}
              group={entry}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          );
        }

        return (
          <SidebarNavItem
            key={entry.href}
            item={entry}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}
