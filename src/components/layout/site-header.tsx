import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Terminal, ShieldCheck, Activity } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Terminal className="h-4 w-4" />
            </div>
            <span>Delta Next.js Scaffold</span>
          </Link>
          <Badge variant="success" className="gap-1 hidden sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            App Router v16
          </Badge>
        </div>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="#architecture"
            className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Architecture
          </Link>
          <Link
            href="#demo"
            className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Interactive Demo
          </Link>
          <Link
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <Activity className="h-4 w-4" />
            <span>API Health</span>
          </Link>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Isolated Agents
          </Badge>
        </nav>
      </div>
    </header>
  );
}
