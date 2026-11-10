"use client";

import * as React from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils/cn";

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
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

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          "text-[#758481] hover:bg-slate-100 hover:text-[#192E32]",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]"
        )}
      >
        <AppIcon name="bell" size="md" />
      </button>

      {/* Popover panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          aria-live="polite"
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[#DFE6E2] bg-[#FFFFFF] p-5 shadow-lg"
        >
          {/* Panel header */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#192E32]">Notifications</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#758481] hover:bg-slate-100 hover:text-[#192E32] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B8881]"
            >
              <AppIcon name="xmark" size="sm" />
            </button>
          </div>

          {/* Body */}
          <div className="rounded-lg bg-[#F4F5F2] p-4 text-center">
            <p className="text-xs text-[#758481]">No unread notifications.</p>
          </div>
        </div>
      )}
    </div>
  );
}
