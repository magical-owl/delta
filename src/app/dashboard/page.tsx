import * as React from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { ContentCard } from "@/components/shared/content-card";
import { PageHeading } from "@/components/shared/page-heading";

/** Static demo metric displayed on the Overview page. */
interface MetricCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  iconName: "users" | "folder" | "circle-check" | "file-lines";
}

function MetricCard({ label, value, trend, trendLabel, iconName }: MetricCardProps) {
  const trendIcon =
    trend === "up" ? "arrow-trend-up" : trend === "down" ? "arrow-trend-down" : null;

  const trendBg =
    trend === "up"
      ? "bg-[#4B8881]/10 text-[#4B8881]"
      : trend === "down"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-[#758481]";

  return (
    <div className="rounded-xl border border-[#DFE6E2] bg-[#FFFFFF] p-6 shadow-xs transition-shadow hover:shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#758481]">
          {label}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4B8881]/10 text-[#4B8881]">
          <AppIcon name={iconName} size="md" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-[#192E32]">{value}</p>
      {trendLabel && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${trendBg}`}
          >
            {trendIcon && <AppIcon name={trendIcon} size="xs" />}
            {trendLabel}
          </span>
          <span className="text-xs text-[#758481]">vs previous period</span>
        </div>
      )}
    </div>
  );
}

/** Static activity log entry. */
interface ActivityEntry {
  id: string;
  event: string;
  actor: string;
  timestamp: string;
  status: "success" | "warning" | "info";
}

const ACTIVITY_LOG: ActivityEntry[] = [
  {
    id: "1",
    event: "Deployment pipeline completed successfully",
    actor: "CI/CD System",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    event: "New user account provisioned with default role",
    actor: "admin@workspace.example",
    timestamp: "14 minutes ago",
    status: "info",
  },
  {
    id: "3",
    event: "Automated compliance audit report generated",
    actor: "Report Scheduler",
    timestamp: "1 hour ago",
    status: "success",
  },
];

const statusColorMap = {
  success: "text-[#4B8881] bg-[#4B8881]/10",
  warning: "text-amber-600 bg-amber-50",
  info: "text-sky-600 bg-sky-50",
} as const;

const statusIconMap = {
  success: "circle-check",
  warning: "triangle-exclamation",
  info: "circle-info",
} as const;

/**
 * Overview page — /dashboard
 * High-end enterprise SaaS dashboard overview landing page.
 */
export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Page heading */}
      <PageHeading
        title="System Overview"
        subtitle="Real-time operational telemetry and enterprise infrastructure status."
      />

      {/* Metrics grid */}
      <section aria-label="Key operational metrics">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Users"
            value="1,284"
            trend="up"
            trendLabel="+12%"
            iconName="users"
          />
          <MetricCard
            label="Active Projects"
            value="47"
            trend="up"
            trendLabel="+3 new"
            iconName="folder"
          />
          <MetricCard
            label="System Uptime"
            value="99.98%"
            trend="neutral"
            trendLabel="Stable"
            iconName="circle-check"
          />
          <MetricCard
            label="Pending Reports"
            value="12"
            trend="down"
            trendLabel="-4"
            iconName="file-lines"
          />
        </div>
      </section>

      {/* Activity log */}
      <ContentCard
        title="Recent System Activity"
        footer="Live workspace event feed &middot; updates continuously."
      >
        <ul className="flex flex-col divide-y divide-[#DFE6E2]/70" role="list">
          {ACTIVITY_LOG.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5 ${statusColorMap[entry.status]}`}
              >
                <AppIcon name={statusIconMap[entry.status]} size="sm" />
              </div>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <span className="text-sm font-semibold text-[#192E32] truncate">
                  {entry.event}
                </span>
                <span className="text-xs text-[#758481]">
                  Initiated by{" "}
                  <strong className="font-medium text-[#192E32]">{entry.actor}</strong>{" "}
                  &middot; {entry.timestamp}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </ContentCard>
    </div>
  );
}
