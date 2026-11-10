import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ContentCardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Reusable surface card for dashboard content regions.
 * Adheres to 12px radius, #FFFFFF surface, #DFE6E2 border, 24px padding.
 */
export function ContentCard({ title, children, footer, className }: ContentCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#DFE6E2] bg-[#FFFFFF] shadow-xs",
        className
      )}
    >
      {title && (
        <div className="border-b border-[#DFE6E2]/70 px-6 py-4">
          <h2 className="text-base font-semibold text-[#192E32]">{title}</h2>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="border-t border-[#DFE6E2]/70 px-6 py-3.5 text-xs text-[#758481]">
          {footer}
        </div>
      )}
    </div>
  );
}
