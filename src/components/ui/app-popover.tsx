"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AppPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const AppPopover: React.FC<AppPopoverProps> = ({
  trigger,
  children,
  align = "left",
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = React.useCallback(
    (next: boolean) => {
      if (controlledIsOpen === undefined) {
        setInternalIsOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledIsOpen, onOpenChange]
  );

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  const alignClass =
    align === "right"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer inline-flex">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="region"
          className={cn(
            "absolute z-40 mt-2 min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-xl animate-scale-in text-[var(--foreground)]",
            alignClass,
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

AppPopover.displayName = "AppPopover";
