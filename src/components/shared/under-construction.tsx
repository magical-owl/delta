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
 * Uses Font Awesome webfonts via AppIcon — no SVG markup.
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
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
          <AppIcon name="screwdriver-wrench" size="xl" className="text-teal-600" />
        </div>

        {/* Heading */}
        <h2 className="mb-2 text-xl font-semibold text-slate-900">{title}</h2>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-slate-500">{description}</p>

        {/* Optional return link */}
        {returnHref && (
          <Link
            href={returnHref}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 transition-colors"
          >
            <AppIcon name="arrow-left" size="sm" />
            {returnLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
