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
        "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        className
      )}
    >
      <AppIcon name={isCollapsed ? "angle-right" : "angle-left"} size="sm" />
    </button>
  );
}
