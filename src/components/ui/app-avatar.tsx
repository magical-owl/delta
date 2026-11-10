"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AppAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const statusClasses: Record<AvatarStatus, string> = {
  online: "bg-[var(--color-success)]",
  busy: "bg-[var(--color-error)]",
  away: "bg-[var(--color-warning)]",
  offline: "bg-[var(--text-muted)]",
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
};

export function AppAvatar({
  src,
  alt = "User Avatar",
  fallback,
  size = "md",
  status,
  className,
  ...props
}: AppAvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;

  return (
    <div
      className={cn("relative inline-flex shrink-0 select-none", className)}
      {...props}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold overflow-hidden border border-[var(--border)]",
          "bg-[var(--surface-muted)] text-[var(--foreground)]",
          sizeClasses[size]
        )}
      >
        {!showFallback ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : fallback ? (
          <span>{fallback}</span>
        ) : (
          <AppIcon name="user" />
        )}
      </div>

      {status && (
        <span
          role="status"
          aria-label={`Status: ${status}`}
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-[var(--surface)]",
            statusClasses[status],
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
}

AppAvatar.displayName = "AppAvatar";
