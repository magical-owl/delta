import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AppSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function AppSkeleton({
  variant = "rectangular",
  className,
  ...props
}: AppSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-[var(--border)]/70",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "circular" && "rounded-full shrink-0",
        variant === "rectangular" && "rounded-xl",
        className
      )}
      {...props}
    />
  );
}

AppSkeleton.displayName = "AppSkeleton";
