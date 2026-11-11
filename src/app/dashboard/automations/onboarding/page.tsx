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

interface OnboardingLog {
  id: string;
  userName: string;
  email: string;
  role: string;
  team: string;
  status: string;
  time: string;
  isSuccess: boolean;
}

export default function UserOnboardingAutomationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-user-onboarding"
  );

  const [name, setName] = React.useState("Elena Rostova");
  const [email, setEmail] = React.useState("elena.dev@delta.local");
  const [role, setRole] = React.useState("Solutions Engineer");
  const [team, setTeam] = React.useState("Platform Engineering");

  const [latestResult, setLatestResult] = React.useState<DispatchWebhookResult | null>(
    null
  );

  const [logs, setLogs] = React.useState<OnboardingLog[]>([
    {
      id: "usr_evt_991",
      userName: "Marcus Brody",
      email: "marcus.brody@delta.local",
      role: "Security Analyst",
      team: "SecOps Squad",
      status: "Dispatched & Welcomed",
      time: "25 mins ago",
      isSuccess: true,
    },
  ]);

  const previewPayload = React.useMemo(
    () => ({
      event: "user.onboarding_triggered",
      actor: {
        userId: "usr_admin_42",
        email: "admin@delta.local",
      },
      invitee: {
        name,
        email,
        assignedRole: role,
        workspaceTeam: team,
        invitationTokenExpiresHours: 48,
        workspaceUrl: "https://delta.local/dashboard",
      },
      notificationChannels: {
        sendgridTemplateId: "d-tmpl-welcome-v2",
        slackAnnouncementChannel: "#general-announcements",
      },
    }),
    [name, email, role, team]
  );

  const handleDispatch = () => {
    const eventId = `evt_user_${Date.now().toString(36)}`;
    const timestamp = new Date().toISOString();

    const payload = {
      ...previewPayload,
      eventId,
      timestamp,
    };

    startTransition(async () => {
      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestResult(result);

      const newLog: OnboardingLog = {
        id: eventId,
        userName: name,
        email,
        role,
        team,
        status: result.success
          ? `${result.status || 200} OK (Welcomed)`
          : result.error || "Delivery Failed",
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
        <AppBadge variant="info" leftIcon="users">
          Basic Tier: User Onboarding Flow
        </AppBadge>
      </div>

      <PageHeading
        title="User Onboarding & Welcome Flow"
        subtitle="Basic Tier (Tier 1): Automatically dispatches welcome email sequences and posts congratulations announcements in your team Slack channel whenever a user is provisioned."
      >
        <Link href="/dashboard/automations">
          <AppButton variant="outline" size="sm">
            Catalog Overview
          </AppButton>
        </Link>
      </PageHeading>

      {/* Architecture Topology */}
      <ContentCard title="Workflow Topology (3–4 Nodes)">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center py-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white mb-2 shadow-xs">
              <AppIcon name="users" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">User Provisioned</div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Delta Admin / Invite
            </div>
          </div>

          <div className="text-[var(--primary)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">Webhook Trigger</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[#FF6D5A] bg-[#FF6D5A]/10 p-3 ring-1 ring-[#FF6D5A]/30">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6D5A] text-white mb-2 shadow-xs">
              <AppIcon name="bolt" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">n8n Formatter</div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Generate Welcome Data
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success)] text-white mb-2 shadow-xs">
              <AppIcon name="circle-check" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Email & Slack</div>
            <div className="text-[10px] text-[var(--text-muted)]">Broadcast Complete</div>
          </div>
        </div>
      </ContentCard>

      {/* Simulator & Payload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Onboarding Trigger Simulator">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Target n8n Webhook URL
              </label>
              <AppInput
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://ozephyrmor.app.n8n.cloud/webhook-test/delta-user-onboarding"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Invitee Full Name
                </label>
                <AppInput value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Invitee Email
                </label>
                <AppInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Assigned Role
                </label>
                <AppInput value={role} onChange={(e) => setRole(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Department / Squad
                </label>
                <AppInput value={team} onChange={(e) => setTeam(e.target.value)} />
              </div>
            </div>

            <div className="pt-2">
              <AppButton
                variant="primary"
                size="md"
                className="w-full justify-center gap-2"
                disabled={isPending}
                onClick={handleDispatch}
              >
                <AppIcon name="users" size="sm" />
                <span>
                  {isPending
                    ? "Dispatching to n8n Onboarding Flow..."
                    : "Simulate User Provisioning Webhook"}
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
                      ? `Onboarding Webhook Acknowledged (${latestResult.status} OK) in ${latestResult.latencyMs}ms`
                      : `Delivery Notice: ${latestResult.error} (${latestResult.latencyMs}ms)`}
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
            <span>Event: user.onboarding_triggered</span>
            <span className="text-[var(--color-success)] font-medium">
              Basic Tier Ingest
            </span>
          </div>
        </ContentCard>
      </div>

      {/* Onboarding Logs Table */}
      <ContentCard title="Recent Onboarding Webhook Dispatches">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Invitee</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Squad</th>
                <th className="pb-2 font-medium">Delivery Status</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 font-semibold text-[var(--foreground)]">
                    {log.userName}
                  </td>
                  <td className="py-2.5 font-mono text-[var(--primary)]">{log.email}</td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.role}</td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.team}</td>
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
