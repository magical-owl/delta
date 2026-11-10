"use client";

import { useEffect } from "react";
import { AppIcon } from "@/components/ui/app-icon";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[32rem] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-red-100 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AppIcon name="triangle-exclamation" size="xl" className="text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          An unexpected error occurred. Please try again or contact support if the problem
          persists.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
