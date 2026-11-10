import * as React from "react";
import Link from "next/link";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";

export interface UnderConstructionProps {
  title?: string;
  description?: string;
  returnHref?: string;
  returnLabel?: string;
  className?: string;
}

/**
 * Reusable page placeholder displayed for routes that are not yet implemented.
 * Adheres to 12px card radius, 8px button radius, and design system color tokens.
 */
export function UnderConstruction({
  title = "Under Construction",
  description = "This section is being built out. Check back soon.",
  returnHref,
  returnLabel = "Return to Overview",
  className,
}: UnderConstructionProps) {
  return (
    <div className={cn("flex min-h-[32rem] items-center justify-center p-6", className)}>
      <div className="w-full max-w-md rounded-xl border border-[#DFE6E2] bg-[#FFFFFF] px-8 py-10 text-center shadow-xs">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4B8881]/10">
          <AppIcon name="screwdriver-wrench" size="xl" className="text-[#4B8881]" />
        </div>

        {/* Heading */}
        <h2 className="mb-2 text-xl font-semibold text-[#192E32]">{title}</h2>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-[#758481]">{description}</p>

        {/* Optional return link */}
        {returnHref && (
          <Link
            href={returnHref}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4B8881] px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#386E69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881] focus-visible:ring-offset-2 transition-colors"
          >
            <AppIcon name="arrow-left" size="sm" />
            {returnLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
