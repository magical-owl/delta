"use client";

import * as React from "react";
import { useTransition } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/dashboard/actions/logout.action";

export function UserMenuPopover() {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        )}
      >
        <AppIcon name="circle-user" size="md" />
      </button>

      {/* Popover panel */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg"
        >
          {/* Sign out action */}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isPending}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              isPending && "pointer-events-none opacity-60"
            )}
          >
            <AppIcon name="right-from-bracket" size="sm" className="shrink-0" />
            <span>{isPending ? "Signing out…" : "Sign Out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
