"use client";

import * as React from "react";
import { useTransition } from "react";
import Link from "next/link";
import { PageHeading } from "@/components/shared/page-heading";
import { ContentCard } from "@/components/shared/content-card";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { AppInput } from "@/components/ui/app-input";
import {
  dispatchWebhookAction,
  type DispatchWebhookResult,
} from "../actions/dispatch-webhook.action";

interface DispatchLogEntry {
  id: string;
  eventName: string;
  destination: string;
  status: string;
  statusCode?: number;
  latencyMs: number;
  timestamp: string;
  isSuccess: boolean;
  responsePreview?: string;
}

const SAMPLE_PAYLOAD_PREVIEW = {
  event: "workspace.health_check",
  timestamp: "2026-11-11T00:00:00.000Z",
  source: "delta-app",
  environment: "development",
  actor: {
    userId: "usr_superadmin",
    email: "superadmin@delta.local",
    role: "Superadmin",
  },
  payload: {
    message: "Test webhook dispatch from Delta Dashboard to n8n",
    systemStatus: "operational",
    activeUsers: 14,
    databaseLatencyMs: 1.8,
  },
};

export default function WebhookAutomationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-events"
  );
  const [latestResult, setLatestResult] = React.useState<DispatchWebhookResult | null>(
    null
  );

  const [dispatchLogs, setDispatchLogs] = React.useState<DispatchLogEntry[]>([
    {
      id: "log_init_01",
      eventName: "workspace.health_check",
      destination: "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-events",
      status: "Ready for Test",
      statusCode: 200,
      latencyMs: 42,
      timestamp: "Initial Ready State",
      isSuccess: true,
    },
  ]);

  const handleSendTest = () => {
    startTransition(async () => {
      const livePayload = {
        ...SAMPLE_PAYLOAD_PREVIEW,
        timestamp: new Date().toISOString(),
      };
      const result = await dispatchWebhookAction(webhookUrl, livePayload);
      setLatestResult(result);

      const newEntry: DispatchLogEntry = {
        id: `log_${Date.now()}`,
        eventName: "workspace.health_check",
        destination: webhookUrl,
        status: result.success ? `${result.status || 200} OK` : result.error || "Failed",
        statusCode: result.status,
        latencyMs: result.latencyMs,
        timestamp: new Date().toLocaleTimeString(),
        isSuccess: result.success,
        responsePreview: result.responseBody
          ? JSON.stringify(result.responseBody, null, 2)
          : undefined,
      };

      setDispatchLogs((prev) => [newEntry, ...prev.slice(0, 9)]);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/automations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          <AppIcon name="arrow-left" size="xs" />
          <span>Back to All Candidates</span>
        </Link>
        <AppBadge variant="primary" leftIcon="arrows-rotate">
          Candidate 01: General Webhook Console
        </AppBadge>
      </div>

      <PageHeading
        title="Option 1: Webhook Automation Hub"
        subtitle="Live outbound & inbound webhook control center connected directly to your n8n cloud instance."
      >
        <Link href="/dashboard/automations">
          <AppButton variant="outline" size="sm">
            Compare Candidates
          </AppButton>
        </Link>
      </PageHeading>

      {/* Architecture Flow Diagram */}
      <ContentCard title="Workflow Topology">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center py-2 text-center">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white mb-2 shadow-xs">
              <AppIcon name="shield-halved" size="sm" />
            </div>
            <div className="text-xs font-semibold text-[var(--foreground)]">
              Delta App
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Trigger Event / Button
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-[var(--primary)]">
            <span className="text-[10px] font-mono font-medium mb-1">POST (JSON)</span>
            <AppIcon name="arrow-right" size="md" className="hidden sm:block" />
            <AppIcon name="arrow-down" size="md" className="block sm:hidden" />
          </div>

          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary)]/5 p-4 ring-1 ring-[var(--primary)]/20">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6D5A] text-white mb-2 shadow-xs">
              <AppIcon name="bolt" size="sm" />
            </div>
            <div className="text-xs font-semibold text-[var(--foreground)]">
              n8n Cloud
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] truncate max-w-[160px] mx-auto">
              ozephyrmor.app.n8n.cloud
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-[var(--color-success)]">
            <span className="text-[10px] font-mono font-medium mb-1">
              200 OK / Callback
            </span>
            <AppIcon name="circle-check" size="md" />
          </div>
        </div>
      </ContentCard>

      {/* Grid: Webhook Configuration & Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration & Dispatcher */}
        <ContentCard title="n8n Webhook Configuration">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[var(--foreground)]">
                  Target n8n Webhook URL
                </label>
                <span className="text-[10px] font-mono text-[var(--primary)] font-semibold">
                  Active Endpoint
                </span>
              </div>
              <AppInput
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://ozephyrmor.app.n8n.cloud/webhook-test/delta-events"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                <strong>Note for test URLs:</strong> In n8n, click{" "}
                <em>&quot;Test step&quot;</em> or{" "}
                <em>&quot;Listen for test event&quot;</em> on your Webhook node before
                clicking the button below so n8n is actively listening.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Security Headers Sent
              </label>
              <div className="rounded-lg bg-[var(--surface-muted)] p-2.5 font-mono text-[11px] text-[var(--foreground)] border border-[var(--border)] space-y-1">
                <div>Content-Type: application/json</div>
                <div>X-Delta-Event: workspace.health_check</div>
                <div>User-Agent: Delta-Dashboard/1.0</div>
              </div>
            </div>

            <div className="pt-2">
              <AppButton
                variant="primary"
                size="md"
                className="w-full justify-center gap-2"
                disabled={isPending}
                onClick={handleSendTest}
              >
                <AppIcon name="bolt" size="sm" />
                <span>
                  {isPending ? "Dispatching to n8n..." : "Send Test Webhook to n8n"}
                </span>
              </AppButton>
            </div>

            {/* Live Response Result */}
            {latestResult && (
              <div
                className={`rounded-lg border p-3.5 text-xs ${
                  latestResult.success
                    ? "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success)]"
                    : "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <AppIcon
                    name={latestResult.success ? "circle-check" : "circle-info"}
                    size="sm"
                  />
                  <span>
                    {latestResult.success
                      ? `Dispatched successfully (${latestResult.status} ${latestResult.statusText || "OK"}) in ${latestResult.latencyMs}ms`
                      : `Delivery Notice: ${latestResult.error} (${latestResult.latencyMs}ms)`}
                  </span>
                </div>
                {latestResult.responseBody ? (
                  <div className="mt-2 rounded bg-[#172632] p-2 text-[#F4F7F6] font-mono text-[11px] overflow-x-auto max-h-40">
                    <pre>
                      {typeof latestResult.responseBody === "object"
                        ? JSON.stringify(latestResult.responseBody, null, 2)
                        : String(latestResult.responseBody)}
                    </pre>
                  </div>
                ) : (
                  !latestResult.success && (
                    <p className="mt-1 text-[11px] opacity-90">
                      If testing with a <code className="font-mono">webhook-test</code>{" "}
                      URL, make sure you clicked{" "}
                      <em>&quot;Listen for test event&quot;</em> in the n8n canvas first.
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </ContentCard>

        {/* Right: Payload Preview */}
        <ContentCard title="Payload Sent to n8n (application/json)">
          <div className="rounded-lg bg-[#172632] p-4 text-[#F4F7F6] font-mono text-xs overflow-x-auto max-h-[300px]">
            <pre>{JSON.stringify(SAMPLE_PAYLOAD_PREVIEW, null, 2)}</pre>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Event: workspace.health_check</span>
            <span className="font-mono">Size: ~412 bytes</span>
          </div>
        </ContentCard>
      </div>

      {/* Recent Dispatches Table */}
      <ContentCard title="Live Webhook Dispatch Log">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Event Name</th>
                <th className="pb-2 font-medium">Destination</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Latency</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              {dispatchLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 font-mono text-[var(--primary)] font-semibold">
                    {log.eventName}
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)] truncate max-w-[260px]">
                    {log.destination}
                  </td>
                  <td className="py-2.5">
                    <AppBadge variant={log.isSuccess ? "success" : "warning"}>
                      {log.status}
                    </AppBadge>
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                    {log.latencyMs}ms
                  </td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
}
