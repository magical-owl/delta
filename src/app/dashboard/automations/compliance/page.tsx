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

interface ArchivalLog {
  id: string;
  scope: string;
  recordsArchived: number;
  digest: string;
  destination: string;
  status: string;
  time: string;
  isSuccess: boolean;
}

export default function ComplianceAutomationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-compliance-archival"
  );

  const [scope, setScope] = React.useState("Full System Audit Trail (audit_events)");
  const [format, setFormat] = React.useState("Compressed JSON.gz + Manifest");
  const [bucket, setBucket] = React.useState(
    "s3://delta-compliance-vault/audit-archives/2026/"
  );

  const [latestResult, setLatestResult] = React.useState<DispatchWebhookResult | null>(
    null
  );

  const [logs, setLogs] = React.useState<ArchivalLog[]>([
    {
      id: "arc_run_4091",
      scope: "Full System Audit Trail",
      recordsArchived: 1842,
      digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      destination: "s3://delta-compliance-vault/audit-archives/2026/run_4091.tar.gz",
      status: "Archived & Verified",
      time: "2 hours ago",
      isSuccess: true,
    },
  ]);

  const previewPayload = React.useMemo(
    () => ({
      event: "compliance.audit_archive_requested",
      requestedBy: "usr_auditor_compliance",
      retentionPolicy: "SOC2_Type2_7_YEARS",
      parameters: {
        sourceTable: "audit_events",
        scope,
        compressionFormat: format,
        cloudStorageDestination: bucket,
        enforceImmutableLock: true,
      },
    }),
    [scope, format, bucket]
  );

  const handleDispatch = () => {
    const archiveJobId = `job_arc_${Date.now().toString(36)}`;
    const timestamp = new Date().toISOString();

    const payload = {
      ...previewPayload,
      archiveJobId,
      timestamp,
    };

    startTransition(async () => {
      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestResult(result);

      const newLog: ArchivalLog = {
        id: archiveJobId,
        scope,
        recordsArchived: Math.floor(450 + Math.random() * 1200),
        digest: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
        destination: `${bucket}${archiveJobId}.tar.gz`,
        status: result.success
          ? `${result.status || 200} OK (Vault Secured)`
          : result.error || "Archival Failed",
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/automations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          <AppIcon name="arrow-left" size="xs" />
          <span>Back to All Automations</span>
        </Link>
        <AppBadge variant="primary" leftIcon="box-archive">
          Intermediate Tier: Compliance & Archival
        </AppBadge>
      </div>

      <PageHeading
        title="Compliance & Audit Trail Archival"
        subtitle="Intermediate Tier (Tier 2): Automates scheduled or on-demand extraction of PostgreSQL audit_events, computes cryptographic checksums, and uploads immutable archives to cloud storage."
      >
        <Link href="/dashboard/automations">
          <AppButton variant="outline" size="sm">
            Catalog Overview
          </AppButton>
        </Link>
      </PageHeading>

      {/* Architecture Topology */}
      <ContentCard title="Workflow Topology (4–5 Nodes)">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center py-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white mb-2 shadow-xs">
              <AppIcon name="clock" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Cron / Webhook</div>
            <div className="text-[10px] text-[var(--text-muted)]">Trigger Pipeline</div>
          </div>

          <div className="text-[var(--primary)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">Query Events</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[#FF6D5A] bg-[#FF6D5A]/10 p-3 ring-1 ring-[#FF6D5A]/30">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6D5A] text-white mb-2 shadow-xs">
              <AppIcon name="bolt" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">
              n8n Digest Engine
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">SHA-256 & Tar.gz</div>
          </div>

          <div className="text-[var(--color-success)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">Push Vault</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success)] text-white mb-2 shadow-xs">
              <AppIcon name="box-archive" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">S3 Bucket</div>
            <div className="text-[10px] text-[var(--text-muted)]">Object Locked</div>
          </div>
        </div>
      </ContentCard>

      {/* Simulator & Payload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Archival Job Simulator">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Target n8n Webhook URL
              </label>
              <AppInput
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://ozephyrmor.app.n8n.cloud/webhook-test/delta-compliance-archival"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Audit Log Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="Full System Audit Trail (audit_events)">
                    Full System Audit Trail (audit_events)
                  </option>
                  <option value="Authentication & Security Only">
                    Authentication & Security Only
                  </option>
                  <option value="RBAC & Role Mutation Events">
                    RBAC & Role Mutation Events
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Export Packaging
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="Compressed JSON.gz + Manifest">
                    Compressed JSON.gz + Manifest
                  </option>
                  <option value="Encrypted Parquet Batch">Encrypted Parquet Batch</option>
                  <option value="Signed CSV Bundle">Signed CSV Bundle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Storage Destination
              </label>
              <AppInput value={bucket} onChange={(e) => setBucket(e.target.value)} />
            </div>

            <div className="pt-2">
              <AppButton
                variant="primary"
                size="md"
                className="w-full justify-center gap-2"
                disabled={isPending}
                onClick={handleDispatch}
              >
                <AppIcon name="box-archive" size="sm" />
                <span>
                  {isPending
                    ? "Executing Compliance Pipeline..."
                    : "Trigger Archival & Hash Verification"}
                </span>
              </AppButton>
            </div>

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
                      ? `Compliance Job Acknowledged (${latestResult.status} OK) in ${latestResult.latencyMs}ms`
                      : `Notice: ${latestResult.error} (${latestResult.latencyMs}ms)`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ContentCard>

        <ContentCard title="Payload Preview (JSON)">
          <div className="rounded-lg bg-[#172632] p-4 text-[#F4F7F6] font-mono text-xs overflow-x-auto max-h-[320px]">
            <pre>{JSON.stringify(previewPayload, null, 2)}</pre>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Event: compliance.audit_archive_requested</span>
            <span className="text-[var(--color-success)] font-medium">
              SOC2 Compliant
            </span>
          </div>
        </ContentCard>
      </div>

      {/* Archival History Table */}
      <ContentCard title="Audit Archival Run Log">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Job ID</th>
                <th className="pb-2 font-medium">Scope</th>
                <th className="pb-2 font-medium">Records</th>
                <th className="pb-2 font-medium">SHA-256 Digest</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 font-mono text-[var(--primary)] font-semibold">
                    {log.id}
                  </td>
                  <td className="py-2.5 text-[var(--foreground)]">{log.scope}</td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                    {log.recordsArchived.toLocaleString()}
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)] truncate max-w-[180px]">
                    {log.digest}
                  </td>
                  <td className="py-2.5">
                    <AppBadge variant={log.isSuccess ? "success" : "warning"}>
                      {log.status}
                    </AppBadge>
                  </td>
                  <td className="py-2.5 text-[var(--text-muted)] font-mono">
                    {log.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
}
