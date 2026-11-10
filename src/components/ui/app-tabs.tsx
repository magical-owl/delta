"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponents must be used within AppTabs");
  return ctx;
}

export interface AppTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function AppTabs({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  className,
  children,
  ...props
}: AppTabsProps) {
  const baseId = React.useId();
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [controlledValue, onValueChange]
  );

  return (
    <TabsContext.Provider
      value={{ value: activeValue, onValueChange: handleValueChange, baseId }}
    >
      <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type AppTabsListProps = React.HTMLAttributes<HTMLDivElement>;

export function AppTabsList({ className, children, ...props }: AppTabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]:not([disabled])'
    );
    if (!tabs || tabs.length === 0) return;

    const tabsArray = Array.from(tabs);
    const currentIndex = tabsArray.findIndex((t) => t === document.activeElement);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabsArray.length;
      tabsArray[nextIndex]?.focus();
      tabsArray[nextIndex]?.click();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
      tabsArray[prevIndex]?.focus();
      tabsArray[prevIndex]?.click();
    } else if (e.key === "Home") {
      e.preventDefault();
      tabsArray[0]?.focus();
      tabsArray[0]?.click();
    } else if (e.key === "End") {
      e.preventDefault();
      tabsArray[tabsArray.length - 1]?.focus();
      tabsArray[tabsArray.length - 1]?.click();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] max-w-full overflow-x-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AppTabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function AppTabsTrigger({
  value,
  className,
  disabled,
  children,
  ...props
}: AppTabsTriggerProps) {
  const { value: activeValue, onValueChange, baseId } = useTabsContext();
  const isSelected = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all select-none cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        isSelected
          ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold"
          : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/40",
        disabled && "pointer-events-none opacity-40 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface AppTabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AppTabsContent({
  value,
  className,
  children,
  ...props
}: AppTabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext();
  const isSelected = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isSelected) return null;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg animate-fade-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
