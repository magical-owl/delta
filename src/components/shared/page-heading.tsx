import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeadingProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable page heading following the 28–32px semibold hierarchy.
 */
export function PageHeading({ title, subtitle, children, className }: PageHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2",
        className
      )}
    >
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-semibold text-[#192E32] tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-[#758481] mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-3 mt-3 sm:mt-0">{children}</div>
      )}
    </div>
  );
}
