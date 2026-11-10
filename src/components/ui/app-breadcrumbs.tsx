import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";

export interface BreadcrumbItemData {
  label: string;
  href?: string;
  current?: boolean;
}

export interface AppBreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItemData[];
}

export function AppBreadcrumbs({ items, className, ...props }: AppBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)} {...props}>
      <ol className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-[10px] text-[var(--text-muted)] opacity-60">
                  <AppIcon name="angle-right" />
                </span>
              )}
              {isCurrent || !item.href ? (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "font-medium",
                    isCurrent
                      ? "text-[var(--foreground)] font-semibold"
                      : "text-[var(--text-muted)]"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[var(--primary)] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

AppBreadcrumbs.displayName = "AppBreadcrumbs";
