import Link from "next/link";
import { AppIcon } from "@/components/ui/app-icon";
import { siteConfig } from "@/config/site";

export interface SidebarBrandProps {
  isCollapsed?: boolean;
}

export function SidebarBrand({ isCollapsed = false }: SidebarBrandProps) {
  return (
    <div className="flex h-16 items-center px-4 border-b border-[#192E32]">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 font-semibold text-[#F4F7F6] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881] rounded-lg"
        title={siteConfig.name}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4B8881] text-white shadow-sm">
          <AppIcon name="shield-halved" size="sm" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden transition-opacity duration-200">
            <span className="truncate text-sm font-semibold tracking-tight text-[#F4F7F6]">
              {siteConfig.name}
            </span>
            <span className="truncate text-[10px] font-medium tracking-wide uppercase text-[#A3B5C0]">
              {siteConfig.tagline}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
