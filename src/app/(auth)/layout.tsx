import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    template: `%s — ${siteConfig.name}`,
    default: siteConfig.name,
  },
};

/**
 * Auth layout — no sidebar or dashboard chrome.
 *
 * The root layout (app/layout.tsx) provides <html>/<body> and ThemeScript.
 * This layout only wraps the content in a centered, padded container.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Site wordmark */}
        <div className="mb-8 flex flex-col items-center gap-1 text-center">
          <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {siteConfig.name}
          </span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
            {siteConfig.tagline}
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
