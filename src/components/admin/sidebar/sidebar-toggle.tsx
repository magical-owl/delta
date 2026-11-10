import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";

export interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
  sidebarId?: string;
}

export function SidebarToggle({
  isCollapsed,
  onToggle,
  className,
  sidebarId = "admin-sidebar",
}: SidebarToggleProps) {
  const label = isCollapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={!isCollapsed}
      aria-controls={sidebarId}
      title={label}
      className={cn(
        "group relative flex w-full min-h-[44px] min-w-[44px] items-center rounded-lg text-sm font-medium text-[#A3B5C0] transition-colors cursor-pointer select-none",
        "hover:bg-[#305B60]/40 hover:text-[#F4F7F6]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]",
        isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
        className
      )}
    >
      <AppIcon
        name={isCollapsed ? "angle-right" : "angle-left"}
        size="sm"
        className="shrink-0 pointer-events-none transition-transform group-hover:scale-110"
      />
      {!isCollapsed && (
        <span className="truncate pointer-events-none font-medium text-sm">
          Collapse sidebar
        </span>
      )}
    </button>
  );
}
