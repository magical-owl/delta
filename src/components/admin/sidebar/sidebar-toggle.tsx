import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";

export interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function SidebarToggle({ isCollapsed, onToggle, className }: SidebarToggleProps) {
  const label = isCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={!isCollapsed}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-[#A3B5C0] hover:bg-[#305B60]/50 hover:text-[#F4F7F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]",
        className
      )}
    >
      <AppIcon name={isCollapsed ? "angle-right" : "angle-left"} size="sm" />
    </button>
  );
}
