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
 */
export function ContentCard({ title, children, footer, className }: ContentCardProps) {
  return (
    <div
      className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}
    >
      {title && (
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
