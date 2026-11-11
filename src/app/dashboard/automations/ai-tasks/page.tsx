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

interface AITaskLog {
  id: string;
  taskTitle: string;
  model: string;
  reasoningSteps: number;
  status: string;
  time: string;
  isSuccess: boolean;
}

export default function AITasksAutomationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-ai-orchestrator"
  );

  const [prompt, setPrompt] = React.useState(
    "Audit recent login failure spikes and correlate with external threat intelligence feeds."
  );
  const [model, setModel] = React.useState("Gemini 1.5 Pro");
  const [maxIterations, setMaxIterations] = React.useState("5");

  const [latestResult, setLatestResult] = React.useState<DispatchWebhookResult | null>(
    null
  );

  const [logs, setLogs] = React.useState<AITaskLog[]>([
    {
      id: "ai_exec_902",
      taskTitle: "Analyze database read throughput and recommend cache TTL tuning",
      model: "Claude 3.5 Sonnet",
      reasoningSteps: 4,
      status: "Synthesized (200 OK)",
      time: "40 mins ago",
      isSuccess: true,
    },
  ]);

  const previewPayload = React.useMemo(
    () => ({
      event: "ai.task_delegation_requested",
      taskDefinition: {
        objective: prompt,
        reasoningEngine: model,
        maxToolCalls: parseInt(maxIterations, 10) || 5,
        availableTools: [
          "delta_database_query_tool",
          "threat_intel_ip_lookup",
          "slack_broadcast_tool",
        ],
        outputFormat: "structured_json_with_citations",
      },
      callbackEndpoint: "https://delta.local/api/webhooks/n8n-callback",
    }),
    [prompt, model, maxIterations]
  );

  const handleDispatch = () => {
    const taskId = `ai_task_${Date.now().toString(36)}`;
    const timestamp = new Date().toISOString();

    const payload = {
      ...previewPayload,
      taskId,
      timestamp,
    };

    startTransition(async () => {
      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestResult(result);

      const newLog: AITaskLog = {
        id: taskId,
        taskTitle: prompt,
        model,
        reasoningSteps: Math.floor(3 + Math.random() * 4),
        status: result.success
          ? `${result.status || 200} OK (Task Delegated)`
          : result.error || "Delegation Failed",
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
        <AppBadge variant="destructive" leftIcon="sliders">
          Advanced Tier: AI Agent Orchestrator
        </AppBadge>
      </div>

      <PageHeading
        title="AI Multi-Agent Task Orchestrator"
        subtitle="Advanced Tier (Tier 3): Autonomous reasoning loops in n8n. Dispatches high-level engineering objectives, queries multiple internal tools & external APIs, and streams synthesized reports back to Delta."
      >
        <Link href="/dashboard/automations">
          <AppButton variant="outline" size="sm">
            Catalog Overview
          </AppButton>
        </Link>
      </PageHeading>

      {/* Architecture Topology */}
      <ContentCard title="Workflow Topology (8+ Nodes / Multi-Agent)">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center py-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white mb-2 shadow-xs">
              <AppIcon name="sliders" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Task Prompt</div>
            <div className="text-[10px] text-[var(--text-muted)]">Delta Dispatch</div>
          </div>

          <div className="text-[var(--primary)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">Async POST</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[#FF6D5A] bg-[#FF6D5A]/10 p-3 ring-1 ring-[#FF6D5A]/30">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6D5A] text-white mb-2 shadow-xs">
              <AppIcon name="bolt" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">n8n AI Reasoner</div>
            <div className="text-[10px] text-[var(--text-muted)]">LLM Tool Loop</div>
          </div>

          <div className="text-[var(--color-success)] flex flex-col items-center">
            <span className="text-[9px] font-mono mb-0.5">Callback Stream</span>
            <AppIcon name="arrow-right" size="sm" />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success)] text-white mb-2 shadow-xs">
              <AppIcon name="circle-check" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Report Ingest</div>
            <div className="text-[10px] text-[var(--text-muted)]">Dashboard Updated</div>
          </div>
        </div>
      </ContentCard>

      {/* Simulator & Payload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="AI Agent Objective Simulator">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Target n8n Webhook URL
              </label>
              <AppInput
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://ozephyrmor.app.n8n.cloud/webhook-test/delta-ai-orchestrator"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Task Objective / Prompt
              </label>
              <AppInput value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Reasoning Engine
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  <option value="GPT-4o Enterprise">GPT-4o Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Max Tool Iterations
                </label>
                <AppInput
                  type="number"
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(e.target.value)}
                />
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
                <AppIcon name="sliders" size="sm" />
                <span>
                  {isPending
                    ? "Dispatching to AI Agent Loop..."
                    : "Delegate Objective to n8n AI Agent"}
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
                      ? `Task Delegated to AI Reasoner (${latestResult.status} OK) in ${latestResult.latencyMs}ms`
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
            <span>Event: ai.task_delegation_requested</span>
            <span className="text-[var(--color-error)] font-semibold">
              Autonomous Execution
            </span>
          </div>
        </ContentCard>
      </div>

      {/* AI Execution History Table */}
      <ContentCard title="Recent Autonomous Agent Task Runs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Task ID</th>
                <th className="pb-2 font-medium">Objective</th>
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Tool Steps</th>
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
                  <td className="py-2.5 text-[var(--foreground)] truncate max-w-[240px]">
                    {log.taskTitle}
                  </td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.model}</td>
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">
                    {log.reasoningSteps} calls
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
