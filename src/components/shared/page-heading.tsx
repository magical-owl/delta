import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeadingProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable page heading with optional subtitle and action slot.
 */
export function PageHeading({ title, subtitle, children, className }: PageHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0">{children}</div>
      )}
    </div>
  );
}
