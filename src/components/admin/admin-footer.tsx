import { siteConfig } from "@/config/site";

export interface AdminFooterProps {
  appName?: string;
}

export function AdminFooter({ appName = siteConfig.name }: AdminFooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-400">
      <p>
        &copy; {new Date().getFullYear()} {appName}. All rights reserved.
      </p>
    </footer>
  );
}
