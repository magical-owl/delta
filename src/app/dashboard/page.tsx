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

  const trendColor =
    trend === "up"
      ? "text-teal-600"
      : trend === "down"
        ? "text-red-500"
        : "text-slate-400";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50">
          <AppIcon name={iconName} size="sm" className="text-teal-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {trendIcon && trendLabel && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}>
          <AppIcon name={trendIcon} size="xs" />
          {trendLabel}
        </p>
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
    event: "Deployment pipeline completed",
    actor: "CI/CD System",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    event: "New user account provisioned",
    actor: "admin@workspace.example",
    timestamp: "14 minutes ago",
    status: "info",
  },
  {
    id: "3",
    event: "Scheduled report generated",
    actor: "Report Scheduler",
    timestamp: "1 hour ago",
    status: "success",
  },
];

const statusIconMap = {
  success: "circle-check",
  warning: "triangle-exclamation",
  info: "circle-info",
} as const;

const statusColorMap = {
  success: "text-teal-500",
  warning: "text-amber-500",
  info: "text-blue-500",
} as const;

/**
 * Overview page — /dashboard
 * Displays a system overview with static demo metrics and an activity log.
 * All data is intentionally static/hardcoded demo content.
 */
export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <PageHeading
        title="System Overview"
        subtitle="Demonstration data — replace with live data sources when ready."
      />

      {/* Metrics grid */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Users"
            value="1,284"
            trend="up"
            trendLabel="+12 this month"
            iconName="users"
          />
          <MetricCard
            label="Active Projects"
            value="47"
            trend="up"
            trendLabel="+3 this week"
            iconName="folder"
          />
          <MetricCard
            label="System Uptime"
            value="99.98%"
            trend="neutral"
            iconName="circle-check"
          />
          <MetricCard
            label="Pending Reports"
            value="12"
            trend="down"
            trendLabel="−4 since yesterday"
            iconName="file-lines"
          />
        </div>
      </section>

      {/* Activity log */}
      <ContentCard
        title="Recent Activity"
        footer="Static demonstration data — connect a real event source to populate this feed."
      >
        <ul className="flex flex-col divide-y divide-slate-100" role="list">
          {ACTIVITY_LOG.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <AppIcon
                name={statusIconMap[entry.status]}
                size="sm"
                className={`mt-0.5 shrink-0 ${statusColorMap[entry.status]}`}
              />
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {entry.event}
                </span>
                <span className="text-xs text-slate-400">
                  {entry.actor} · {entry.timestamp}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </ContentCard>
    </div>
  );
}
