export function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Production Next.js Scaffold with Multi-Agent Orchestration • Official
          Documentation Compliant
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Strict Development / Runtime Boundary Enforced
        </p>
      </div>
    </footer>
  );
}
