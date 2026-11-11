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

interface SecOpsTriageResult {
  incidentTicket?: string;
  severityLevel?: string;
  threatScore?: number;
  targetChannel?: string;
  escalationAction?: string;
  dispatchMessage?: string;
  autoMitigation?: string;
  attackerIp?: string;
  executionId?: string;
}

interface SecurityIncidentLog {
  id: string;
  ticket?: string;
  event: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  attackerIp: string;
  targetAccount: string;
  escalationStatus: string;
  time: string;
  isSuccess: boolean;
}

export default function SecurityAutomationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-security-alerts"
  );

  // Simulator Form State
  const [eventType, setEventType] = React.useState<
    | "auth.login_denied"
    | "role.unauthorized_mutation"
    | "ratelimit.exceeded"
    | "auth.login_failed"
  >("auth.login_denied");
  const [severity, setSeverity] = React.useState<"CRITICAL" | "HIGH" | "MEDIUM">(
    "CRITICAL"
  );
  const [attackerIp, setAttackerIp] = React.useState("198.51.100.42");
  const [targetAccount, setTargetAccount] = React.useState("admin@delta.local");

  const [latestResult, setLatestResult] = React.useState<DispatchWebhookResult | null>(
    null
  );
  const [secOpsResponse, setSecOpsResponse] = React.useState<SecOpsTriageResult | null>(
    null
  );

  const [incidentLogs, setIncidentLogs] = React.useState<SecurityIncidentLog[]>([
    {
      id: "inc_init_01",
      ticket: "SEC-4912",
      event: "auth.login_denied",
      severity: "CRITICAL",
      attackerIp: "198.51.100.42",
      targetAccount: "admin@delta.local",
      escalationStatus: "PAGED_ONCALL_SECOPS",
      time: "5 mins ago",
      isSuccess: true,
    },
  ]);

  // Update severity automatically based on event type
  const handleEventTypeChange = (newType: typeof eventType) => {
    setEventType(newType);
    if (newType === "auth.login_denied" || newType === "role.unauthorized_mutation") {
      setSeverity("CRITICAL");
    } else if (newType === "ratelimit.exceeded") {
      setSeverity("HIGH");
    } else {
      setSeverity("MEDIUM");
    }
  };

  const previewPayload = React.useMemo(
    () => ({
      event: "security.incident_alert",
      sourceTable: "audit_events",
      severity,
      actor: {
        ipAddress: attackerIp,
        userAgent: "curl/8.4.0 (Automated Scanner)",
      },
      details: {
        action: eventType,
        targetAccount,
        reason:
          eventType === "auth.login_denied"
            ? "Account disabled or unauthorized privilege probe"
            : eventType === "role.unauthorized_mutation"
              ? "Attempted direct elevation to Superadmin role"
              : "Rate limit threshold breached (5 attempts in 15m)",
      },
    }),
    [severity, attackerIp, eventType, targetAccount]
  );

  const handleDispatch = () => {
    const timestamp = new Date().toISOString();
    const incidentId = `inc_sec_${Date.now().toString(36)}`;

    const payload = {
      ...previewPayload,
      incidentId,
      timestamp,
    };

    startTransition(async () => {
      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestResult(result);

      let parsed: SecOpsTriageResult | null = null;
      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        parsed = result.responseBody as SecOpsTriageResult;
        setSecOpsResponse(parsed);
      } else {
        setSecOpsResponse(null);
      }

      const newLog: SecurityIncidentLog = {
        id: incidentId,
        ticket:
          parsed?.incidentTicket || `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
        event: eventType,
        severity,
        attackerIp,
        targetAccount,
        escalationStatus: result.success
          ? parsed?.escalationAction || "ESCALATED"
          : result.error || "Failed",
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setIncidentLogs((prev) => [newLog, ...prev.slice(0, 9)]);
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
        <AppBadge variant="warning" leftIcon="shield-halved">
          Candidate 03: Security & Incident Alerts
        </AppBadge>
      </div>

      <PageHeading
        title="Option 3: Security Alert Escalation"
        subtitle="Monitors Delta's PostgreSQL audit_events stream. Dispatches high-severity alerts to n8n for emergency SecOps containment, PagerDuty paging, and Slack broadcast."
      >
        <Link href="/dashboard/automations">
          <AppButton variant="outline" size="sm">
            Compare Candidates
          </AppButton>
        </Link>
      </PageHeading>

      {/* Architecture Flow */}
      <ContentCard title="Security Incident Escalation Pipeline">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center py-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-error)] text-white mb-2 shadow-xs">
              <AppIcon name="triangle-exclamation" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Audit Event</div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Postgres audit_events
            </div>
          </div>

          <div className="text-[var(--color-error)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">High Severity Webhook</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[#FF6D5A] bg-[#FF6D5A]/10 p-3 ring-1 ring-[#FF6D5A]/30">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6D5A] text-white mb-2 shadow-xs">
              <AppIcon name="bolt" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">
              n8n Incident Node
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Threat Evaluator</div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--foreground)] text-white mb-2 shadow-xs">
              <AppIcon name="bell" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">SecOps Paged</div>
            <div className="text-[10px] text-[var(--text-muted)]">PagerDuty & Slack</div>
          </div>
        </div>
      </ContentCard>

      {/* Simulator & Payload Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Incident Simulator Form */}
        <ContentCard title="Security Incident Simulator">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Target n8n Webhook URL
              </label>
              <AppInput
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://ozephyrmor.app.n8n.cloud/webhook-test/delta-security-alerts"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Point this to your n8n &quot;delta-security-alerts&quot; webhook node.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Incident Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) =>
                    handleEventTypeChange(e.target.value as typeof eventType)
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="auth.login_denied">
                    auth.login_denied (Brute Force)
                  </option>
                  <option value="role.unauthorized_mutation">
                    role.unauthorized_mutation (Escalation)
                  </option>
                  <option value="ratelimit.exceeded">
                    ratelimit.exceeded (IP Flooding)
                  </option>
                  <option value="auth.login_failed">
                    auth.login_failed (Bad Password)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Severity Threshold
                </label>
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as "CRITICAL" | "HIGH" | "MEDIUM")
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] font-semibold"
                >
                  <option value="CRITICAL">CRITICAL (Trigger P0)</option>
                  <option value="HIGH">HIGH (Alert On-Call)</option>
                  <option value="MEDIUM">MEDIUM (Log to SIEM)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Suspect IP Address
                </label>
                <AppInput
                  value={attackerIp}
                  onChange={(e) => setAttackerIp(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Target Account
                </label>
                <AppInput
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <AppButton
                variant="destructive"
                size="md"
                className="w-full justify-center gap-2"
                disabled={isPending}
                onClick={handleDispatch}
              >
                <AppIcon name="triangle-exclamation" size="sm" />
                <span>
                  {isPending
                    ? "Dispatching to SecOps Webhook..."
                    : "Simulate & Dispatch Security Alert to n8n"}
                </span>
              </AppButton>
            </div>

            {/* Live SecOps Response Card */}
            {latestResult && (
              <div
                className={`rounded-lg border p-3.5 text-xs ${
                  latestResult.success
                    ? "bg-[var(--color-error-bg)] border-[var(--color-error-border)] text-[var(--color-error)]"
                    : "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <AppIcon
                    name={latestResult.success ? "triangle-exclamation" : "circle-info"}
                    size="sm"
                  />
                  <span>
                    {latestResult.success
                      ? `Security Incident Received (${latestResult.status} OK) in ${latestResult.latencyMs}ms`
                      : `Delivery Notice: ${latestResult.error} (${latestResult.latencyMs}ms)`}
                  </span>
                </div>

                {secOpsResponse && (
                  <div className="mt-3 rounded-lg bg-[var(--surface)] p-3 text-[var(--foreground)] border border-[var(--border)] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Ticket Generated:</span>
                      <code className="font-mono text-xs font-bold text-[var(--color-error)]">
                        {secOpsResponse.incidentTicket}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Threat Score:</span>
                      <AppBadge variant="destructive">
                        {secOpsResponse.threatScore ?? 95} / 100
                      </AppBadge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Broadcast Channel:</span>
                      <code className="font-mono text-xs">
                        {secOpsResponse.targetChannel}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Escalation Action:</span>
                      <span className="font-semibold text-xs text-[var(--foreground)]">
                        {secOpsResponse.escalationAction}
                      </span>
                    </div>
                    {secOpsResponse.autoMitigation && (
                      <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border)]/60">
                        <strong>Mitigation:</strong> {secOpsResponse.autoMitigation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ContentCard>

        {/* Right: Security Payload Preview */}
        <ContentCard title="Security Alert Payload (JSON)">
          <div className="rounded-lg bg-[#172632] p-4 text-[#F4F7F6] font-mono text-xs overflow-x-auto max-h-[340px]">
            <pre>{JSON.stringify(previewPayload, null, 2)}</pre>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Event: security.incident_alert</span>
            <span className="text-[var(--color-error)] font-semibold">
              Immediate Dispatch
            </span>
          </div>
        </ContentCard>
      </div>

      {/* Recent Security Incidents Table */}
      <ContentCard title="Recent Security Incidents & Escalation Stream">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Ticket</th>
                <th className="pb-2 font-medium">Event Type</th>
                <th className="pb-2 font-medium">Severity</th>
                <th className="pb-2 font-medium">Suspect IP</th>
                <th className="pb-2 font-medium">Target Account</th>
                <th className="pb-2 font-medium">Escalation Action</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              {incidentLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 font-mono text-[var(--color-error)] font-bold">
                    {log.ticket}
                  </td>
                  <td className="py-2.5 font-mono text-[var(--foreground)]">
                    {log.event}
                  </td>
                  <td className="py-2.5">
                    <AppBadge
                      variant={
                        log.severity === "CRITICAL"
                          ? "destructive"
                          : log.severity === "HIGH"
                            ? "warning"
                            : "default"
                      }
                    >
                      {log.severity}
                    </AppBadge>
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                    {log.attackerIp}
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                    {log.targetAccount}
                  </td>
                  <td className="py-2.5">
                    <AppBadge variant={log.isSuccess ? "error" : "warning"}>
                      {log.escalationStatus}
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
