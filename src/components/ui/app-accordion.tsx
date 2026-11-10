"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./app-icon";

interface AccordionContextValue {
  openValues: string[];
  toggleValue: (val: string) => void;
  baseId: string;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) {
    throw new Error("Accordion subcomponents must be used within AppAccordion");
  }
  return ctx;
}

export interface AppAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
}

export function AppAccordion({
  type = "single",
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  className,
  children,
  ...props
}: AppAccordionProps) {
  const baseId = React.useId();
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);

  const activeValues = controlledValue !== undefined ? controlledValue : internalValue;

  const toggleValue = (val: string) => {
    let next: string[];
    if (type === "single") {
      next = activeValues.includes(val) ? [] : [val];
    } else {
      next = activeValues.includes(val)
        ? activeValues.filter((v) => v !== val)
        : [...activeValues, val];
    }

    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <AccordionContext.Provider value={{ openValues: activeValues, toggleValue, baseId }}>
      <div
        className={cn("flex flex-col divide-y divide-[var(--border)]", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

export interface AppAccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AppAccordionItem({
  value,
  className,
  children,
  ...props
}: AppAccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn("py-1", className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export type AppAccordionTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function AppAccordionTrigger({
  className,
  children,
  ...props
}: AppAccordionTriggerProps) {
  const { openValues, toggleValue, baseId } = useAccordionContext();
  const item = React.useContext(AccordionItemContext);
  if (!item) {
    throw new Error("AppAccordionTrigger must be inside an AppAccordionItem");
  }

  const isOpen = openValues.includes(item.value);
  const triggerId = `${baseId}-trigger-${item.value}`;
  const contentId = `${baseId}-content-${item.value}`;

  return (
    <button
      id={triggerId}
      type="button"
      aria-expanded={isOpen}
      aria-controls={contentId}
      onClick={() => toggleValue(item.value)}
      className={cn(
        "flex w-full items-center justify-between py-3 font-medium text-sm text-[var(--foreground)] transition-all hover:text-[var(--primary)] text-left select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-md",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <span
        className={cn(
          "text-[var(--text-muted)] transition-transform duration-200",
          isOpen && "rotate-180 text-[var(--primary)]"
        )}
      >
        <AppIcon name="chevron-down" size="xs" />
      </span>
    </button>
  );
}

export type AppAccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

export function AppAccordionContent({
  className,
  children,
  ...props
}: AppAccordionContentProps) {
  const { openValues, baseId } = useAccordionContext();
  const item = React.useContext(AccordionItemContext);
  if (!item) {
    throw new Error("AppAccordionContent must be inside an AppAccordionItem");
  }

  const isOpen = openValues.includes(item.value);
  const triggerId = `${baseId}-trigger-${item.value}`;
  const contentId = `${baseId}-content-${item.value}`;

  if (!isOpen) return null;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn(
        "pb-4 pt-1 text-sm text-[var(--text-muted)] leading-relaxed animate-fade-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
