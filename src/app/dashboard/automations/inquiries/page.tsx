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

interface InquiryTriageResult {
  priorityTier?: string;
  assignedSquad?: string;
  targetSlackChannel?: string;
  slaResponseHours?: number;
  routingResult?: string;
  badgeStatus?: string;
  executionId?: string;
}

interface InquiryLog {
  id: string;
  email: string;
  category: string;
  urgency: string;
  subject: string;
  priorityTier?: string;
  assignedSquad?: string;
  targetSlackChannel?: string;
  sla?: number;
  status: string;
  time: string;
  isSuccess: boolean;
}

export default function InquiryAutomationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-inquiries"
  );

  // Form State for Live Interactive Simulator
  const [email, setEmail] = React.useState("alex.vance@enterprise.corp");
  const [category, setCategory] = React.useState<
    "architecture" | "security" | "technical" | "general"
  >("architecture");
  const [urgency, setUrgency] = React.useState<"high" | "medium" | "low">("high");
  const [subject, setSubject] = React.useState(
    "Inquiring about multi-tenant agent architecture & SLA"
  );

  const [latestResult, setLatestResult] = React.useState<DispatchWebhookResult | null>(
    null
  );
  const [triageData, setTriageData] = React.useState<InquiryTriageResult | null>(null);

  const [inquiryLogs, setInquiryLogs] = React.useState<InquiryLog[]>([
    {
      id: "inq_init_9182",
      email: "sarah.cto@healthtech.io",
      category: "security",
      urgency: "high",
      subject: "SOC2 compliance & audit log export verification",
      priorityTier: "P1_CRITICAL",
      assignedSquad: "Security Operations (SecOps)",
      targetSlackChannel: "#alerts-urgent",
      sla: 2,
      status: "ESCALATED_P1",
      time: "10 mins ago",
      isSuccess: true,
    },
  ]);

  const previewPayload = React.useMemo(
    () => ({
      event: "inquiry.received",
      contact: {
        email,
        name: email.split("@")[0] || "Valued Lead",
      },
      data: {
        category,
        urgency,
        subject,
        message:
          "We are evaluating Delta for our team. We require webhook callbacks and custom n8n integrations.",
      },
    }),
    [email, category, urgency, subject]
  );

  const handleDispatch = () => {
    const timestamp = new Date().toISOString();
    const inquiryId = `inq_${Date.now().toString(36)}`;

    const payload = {
      ...previewPayload,
      timestamp,
      inquiryId,
    };

    startTransition(async () => {
      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestResult(result);

      let parsedTriage: InquiryTriageResult | null = null;
      if (
        result.success &&
        result.responseBody &&
        typeof result.responseBody === "object"
      ) {
        parsedTriage = result.responseBody as InquiryTriageResult;
        setTriageData(parsedTriage);
      } else {
        setTriageData(null);
      }

      const newLog: InquiryLog = {
        id: inquiryId,
        email,
        category,
        urgency,
        subject,
        priorityTier:
          parsedTriage?.priorityTier ||
          (urgency === "high" ? "P1_CRITICAL" : "P2_STANDARD"),
        assignedSquad:
          parsedTriage?.assignedSquad ||
          (category === "security" ? "Security Operations" : "Solutions Architecture"),
        targetSlackChannel:
          parsedTriage?.targetSlackChannel ||
          (urgency === "high" ? "#alerts-urgent" : "#leads-inbound"),
        sla: parsedTriage?.slaResponseHours || (urgency === "high" ? 2 : 8),
        status: result.success
          ? parsedTriage?.badgeStatus || "200 OK"
          : result.error || "Failed",
        time: new Date().toLocaleTimeString(),
        isSuccess: result.success,
      };

      setInquiryLogs((prev) => [newLog, ...prev.slice(0, 9)]);
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
        <AppBadge variant="success" leftIcon="envelope">
          Candidate 02: Inquiry & Lead Triage
        </AppBadge>
      </div>

      <PageHeading
        title="Option 2: Inquiry Triage Pipeline"
        subtitle="Processes public landing page inquiries, evaluates urgency & category, and routes triage outcomes to n8n in real-time."
      >
        <Link href="/dashboard/automations">
          <AppButton variant="outline" size="sm">
            Compare Candidates
          </AppButton>
        </Link>
      </PageHeading>

      {/* Architecture Flow */}
      <ContentCard title="Inquiry Pipeline Architecture">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center py-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white mb-2 shadow-xs">
              <AppIcon name="envelope" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Homepage Form</div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Lead / User Submits
            </div>
          </div>

          <div className="text-[var(--primary)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">Webhook POST</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[#FF6D5A] bg-[#FF6D5A]/10 p-3 ring-1 ring-[#FF6D5A]/30">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6D5A] text-white mb-2 shadow-xs">
              <AppIcon name="bolt" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">n8n Pipeline</div>
            <div className="text-[10px] text-[var(--text-muted)]">AI Triage & Router</div>
          </div>

          <div className="text-[var(--color-success)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">Dispatches To</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success)] text-white mb-2 shadow-xs">
              <AppIcon name="check" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Slack & CRM</div>
            <div className="text-[10px] text-[var(--text-muted)]">Squad Paged</div>
          </div>
        </div>
      </ContentCard>

      {/* Interactive Simulator & Payload Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Inquiry Form Simulator */}
        <ContentCard title="Inquiry Intake Simulator">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Target n8n Webhook URL
              </label>
              <AppInput
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://ozephyrmor.app.n8n.cloud/webhook-test/delta-inquiries"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Point this to your n8n &quot;delta-inquiries&quot; webhook node.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as
                        "architecture" | "security" | "technical" | "general"
                    )
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="architecture">Architecture</option>
                  <option value="security">Security</option>
                  <option value="technical">Technical</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) =>
                    setUrgency(e.target.value as "high" | "medium" | "low")
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="high">High (SLA: 2h)</option>
                  <option value="medium">Medium (SLA: 8h)</option>
                  <option value="low">Low (SLA: 24h)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Lead Email Address
              </label>
              <AppInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Inquiry Subject
              </label>
              <AppInput value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div className="pt-2">
              <AppButton
                variant="primary"
                size="md"
                className="w-full justify-center gap-2"
                disabled={isPending}
                onClick={handleDispatch}
              >
                <AppIcon name="envelope" size="sm" />
                <span>
                  {isPending
                    ? "Dispatching to n8n Triage..."
                    : "Submit & Trigger n8n Triage Pipeline"}
                </span>
              </AppButton>
            </div>

            {/* Live Triage Outcome Card */}
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
                      ? `Triage Processed (${latestResult.status} OK) in ${latestResult.latencyMs}ms`
                      : `Notice: ${latestResult.error} (${latestResult.latencyMs}ms)`}
                  </span>
                </div>

                {triageData && (
                  <div className="mt-3 rounded-lg bg-[var(--surface)] p-3 text-[var(--foreground)] border border-[var(--border)] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Assigned Squad:</span>
                      <span className="font-semibold text-[var(--primary)]">
                        {triageData.assignedSquad || "Solutions Engineering"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">Target Channel:</span>
                      <code className="font-mono text-xs text-[var(--foreground)]">
                        {triageData.targetSlackChannel || "#leads-enterprise"}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted)]">SLA Response Time:</span>
                      <AppBadge variant={urgency === "high" ? "error" : "primary"}>
                        {triageData.slaResponseHours || 2} Hours
                      </AppBadge>
                    </div>
                    {triageData.routingResult && (
                      <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border)]/60">
                        {triageData.routingResult}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ContentCard>

        {/* Right: Payload Preview */}
        <ContentCard title="Inquiry Webhook Payload (JSON)">
          <div className="rounded-lg bg-[#172632] p-4 text-[#F4F7F6] font-mono text-xs overflow-x-auto max-h-[340px]">
            <pre>{JSON.stringify(previewPayload, null, 2)}</pre>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Event: inquiry.received</span>
            <span className="text-[var(--color-success)] font-medium">
              Ready for n8n Webhook Node
            </span>
          </div>
        </ContentCard>
      </div>

      {/* Inquiry Triage Log Table */}
      <ContentCard title="Recent Inquiries & n8n Triage Status">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Lead Email</th>
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Urgency</th>
                <th className="pb-2 font-medium">Assigned Squad</th>
                <th className="pb-2 font-medium">Triage Status</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              {inquiryLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 font-mono text-[var(--primary)] font-semibold">
                    {log.email}
                  </td>
                  <td className="py-2.5 text-[var(--foreground)] truncate max-w-[200px]">
                    {log.subject}
                  </td>
                  <td className="py-2.5 capitalize text-[var(--text-muted)]">
                    {log.category}
                  </td>
                  <td className="py-2.5">
                    <AppBadge
                      variant={
                        log.urgency === "high"
                          ? "error"
                          : log.urgency === "medium"
                            ? "warning"
                            : "default"
                      }
                    >
                      {log.urgency}
                    </AppBadge>
                  </td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.assignedSquad}</td>
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
