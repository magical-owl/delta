import { siteConfig } from "@/config/site";

export interface AdminFooterProps {
  appName?: string;
}

export function AdminFooter({ appName = siteConfig.name }: AdminFooterProps) {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#DFE6E2] py-4 px-6 lg:px-8 text-xs text-[#758481] flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>
        &copy; {new Date().getFullYear()} {appName}. All rights reserved.
      </p>
      <div className="flex items-center gap-4 text-xs text-[#758481]">
        <span>Version {siteConfig.version ?? "1.0.0"}</span>
        <span>&middot;</span>
        <span className="inline-flex items-center gap-1.5 text-[#4B8881]">
          <span className="h-2 w-2 rounded-full bg-[#4B8881]"></span>
          Operational
        </span>
      </div>
    </footer>
  );
}
