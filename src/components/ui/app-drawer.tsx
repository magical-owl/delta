"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";

export interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  position?: "right" | "left";
  maxWidth?: "sm" | "md" | "lg";
  className?: string;
}

const emptySubscribe = () => () => {};

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

export const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  footer,
  children,
  position = "right",
  maxWidth = "md",
  className,
}) => {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const titleId = React.useId();
  const descId = React.useId();
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);

  // Escape key and scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus into drawer
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  const positionClass =
    position === "left"
      ? "left-0 border-r border-[var(--border)] animate-slide-in-left"
      : "right-0 border-l border-[var(--border)] animate-slide-in-right";

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "fixed inset-y-0 flex flex-col w-full bg-[var(--surface-elevated)] shadow-2xl z-10 text-left",
          maxWidthMap[maxWidth],
          positionClass,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[var(--border)]">
          <div className="flex flex-col gap-1">
            {title && (
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="text-sm text-[var(--text-muted)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 -mr-1 -mt-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
          >
            <AppIcon name="xmark" size="md" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-[var(--foreground)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

AppDrawer.displayName = "AppDrawer";
