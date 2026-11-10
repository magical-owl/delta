import { inquiryService } from "@/server/services/inquiry.service";
import { Badge } from "@/components/ui/badge";
import { Layers, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

/**
 * Server Component displaying real-time system metrics.
 * Accesses domain service directly without internal HTTP round trips.
 */
export async function InquirySummary() {
  const summary = await inquiryService.getSummary();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
          <Layers className="h-4 w-4 text-blue-500" />
          <span>Total Logged</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {summary.totalInquiries}
        </p>
        <p className="text-xs text-slate-400 mt-1">Inquiries recorded</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
          <Cpu className="h-4 w-4 text-purple-500" />
          <span>Architecture</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {summary.categories.architecture}
        </p>
        <Badge variant="outline" className="mt-1 text-[10px]">
          Design reviews
        </Badge>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <span>Security</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {summary.categories.security}
        </p>
        <Badge variant="outline" className="mt-1 text-[10px]">
          Audit queries
        </Badge>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Technical</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {summary.categories.technical + summary.categories.general}
        </p>
        <Badge variant="outline" className="mt-1 text-[10px]">
          General & Tech
        </Badge>
      </div>
    </div>
  );
}
