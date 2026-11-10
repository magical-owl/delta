"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface HeaderActionButtonProps {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
}

export function HeaderActionButton({
  label,
  onClick,
  children,
  className,
}: HeaderActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-lg",
        "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        className
      )}
    >
      {children}
    </button>
  );
}
