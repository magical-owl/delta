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

interface VideoRadarLog {
  id: string;
  niche: string;
  platform: string;
  targetFormat: string;
  status: string;
  time: string;
  isSuccess: boolean;
}

export default function VideoRadarAutomationPage() {
  const [isPending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = React.useState(
    "https://ozephyrmor.app.n8n.cloud/webhook-test/delta-video-radar"
  );

  const [niche, setNiche] = React.useState("Next.js & AI Coding Workflows");
  const [platform, setPlatform] = React.useState("YouTube Shorts");
  const [targetFormat, setTargetFormat] = React.useState("Short-Form (60s Vertical)");
  const [tone, setTone] = React.useState("Energetic & Direct");
  const [region, setRegion] = React.useState("US");

  const [latestResult, setLatestResult] = React.useState<DispatchWebhookResult | null>(
    null
  );

  const [logs, setLogs] = React.useState<VideoRadarLog[]>([
    {
      id: "vid_run_401",
      niche: "Solo SaaS Devlog & Automation",
      platform: "YouTube Shorts",
      targetFormat: "Short-Form (60s Vertical)",
      status: "Blueprint Ready (200 OK)",
      time: "18 mins ago",
      isSuccess: true,
    },
  ]);

  const previewPayload = React.useMemo(
    () => ({
      event: "creator.video_radar_requested",
      niche,
      platform,
      targetFormat,
      tone,
      region,
      analysisOptions: {
        minOutlierMultiplier: 5.0,
        extractHooks: true,
        analyzeCommentGaps: true,
        includeRenderPayload: true,
      },
      renderTarget: {
        provider: "Creatomate + ElevenLabs TTS",
        aspectRatio: targetFormat.includes("Vertical") ? "9:16" : "16:9",
      },
    }),
    [niche, platform, targetFormat, tone, region]
  );

  const handleDispatch = () => {
    const runId = `vid_run_${Date.now().toString(36)}`;
    const timestamp = new Date().toISOString();

    const payload = {
      ...previewPayload,
      runId,
      timestamp,
    };

    startTransition(async () => {
      const result = await dispatchWebhookAction(webhookUrl, payload);
      setLatestResult(result);

      const newLog: VideoRadarLog = {
        id: runId,
        niche,
        platform,
        targetFormat,
        status: result.success
          ? `${result.status || 200} OK (Blueprint Generated)`
          : result.error || "Dispatch Failed",
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
        <AppBadge variant="destructive" leftIcon="video">
          Advanced Tier: Creator Video Radar
        </AppBadge>
      </div>

      <PageHeading
        title="Trending Video Radar & Script Generator"
        subtitle="Advanced Tier (Tier 3): Fetches trending videos in your niche, calculates outlier scores (views vs. subscribers), extracts winning 3-second hooks, and builds original scripts + render-ready payloads."
      >
        <Link href="/dashboard/automations">
          <AppButton variant="outline" size="sm">
            Catalog Overview
          </AppButton>
        </Link>
      </PageHeading>

      {/* Architecture Topology */}
      <ContentCard title="Workflow Topology (6–9 Nodes / Creator Pipeline)">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center py-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white mb-2 shadow-xs">
              <AppIcon name="bolt" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Niche Trigger</div>
            <div className="text-[10px] text-[var(--text-muted)]">Webhook / Schedule</div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-info)] text-white mb-2 shadow-xs">
              <AppIcon name="magnifying-glass" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Trend Fetch</div>
            <div className="text-[10px] text-[var(--text-muted)]">
              YouTube API / Apify
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-warning)] text-white mb-2 shadow-xs">
              <AppIcon name="fire" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Outlier Scorer</div>
            <div className="text-[10px] text-[var(--text-muted)]">Views / Subs Ratio</div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-error)] text-white mb-2 shadow-xs">
              <AppIcon name="sliders" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">AI Scriptwriter</div>
            <div className="text-[10px] text-[var(--text-muted)]">Hooks & Storyboard</div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success)] text-white mb-2 shadow-xs">
              <AppIcon name="video" size="sm" />
            </div>
            <div className="font-semibold text-[var(--foreground)]">Render Payload</div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Creatomate / Notion
            </div>
          </div>
        </div>
      </ContentCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Creator Radar Simulator */}
        <ContentCard title="Dispatch Video Radar Scan to n8n">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                n8n Video Radar Webhook URL
              </label>
              <AppInput
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://ozephyrmor.app.n8n.cloud/webhook-test/delta-video-radar"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Target Niche / Topic
              </label>
              <AppInput
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., Next.js & AI Coding Workflows"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Source Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="YouTube Long-Form">YouTube Long-Form</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Output Format
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Short-Form (60s Vertical)">
                    Short-Form (60s Vertical)
                  </option>
                  <option value="Long-Form Vlog (8-12m)">Long-Form Vlog (8-12m)</option>
                  <option value="Render-Ready JSON (Creatomate)">
                    Render-Ready JSON (Creatomate)
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Creator Tone / Pacing
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Energetic & Direct">Energetic & Direct</option>
                  <option value="Calm Documentary">Calm Documentary</option>
                  <option value="Fast-Paced Tutorial">Fast-Paced Tutorial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Region Code
                </label>
                <AppInput
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="US"
                />
              </div>
            </div>

            <AppButton
              variant="primary"
              size="md"
              onClick={handleDispatch}
              disabled={isPending}
              className="w-full justify-center"
            >
              <AppIcon
                name={isPending ? "spinner" : "video"}
                spin={isPending}
                size="sm"
              />
              <span className="ml-2">
                {isPending
                  ? "Scanning Trends & Generating Script..."
                  : "Scan Trends & Generate Video Blueprint"}
              </span>
            </AppButton>

            {latestResult && (
              <div
                className={`rounded-lg border p-3 text-xs ${
                  latestResult.success
                    ? "border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
                    : "border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)]"
                }`}
              >
                <div className="font-semibold">
                  {latestResult.success
                    ? `Dispatched Successfully (${latestResult.latencyMs}ms)`
                    : `Dispatch Failed: ${latestResult.error}`}
                </div>
                {latestResult.responseBody !== undefined && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-[#172632] p-2 text-[10px] text-[#F4F7F6]">
                    {JSON.stringify(latestResult.responseBody, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </ContentCard>

        {/* Right: Payload Preview & Import Guide */}
        <ContentCard title="Payload & Workflow Import Guide">
          <div className="space-y-4">
            <div className="rounded-lg bg-[#172632] p-4 text-[#F4F7F6] font-mono text-xs overflow-x-auto max-h-[260px]">
              <pre>{JSON.stringify(previewPayload, null, 2)}</pre>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs space-y-1.5">
              <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <AppIcon name="circle-info" size="xs" />
                <span>How to Activate in n8n Cloud</span>
              </div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Import{" "}
                <code className="text-[var(--foreground)] font-mono">
                  docs/n8n/delta-video-radar.json
                </code>{" "}
                into your n8n canvas, click <strong>Listen for test event</strong> on the
                Webhook node, then trigger a scan from the left panel.
              </p>
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Dispatch Logs */}
      <ContentCard title="Video Radar Execution History">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Run ID</th>
                <th className="pb-2 font-medium">Niche</th>
                <th className="pb-2 font-medium">Platform</th>
                <th className="pb-2 font-medium">Output Format</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-muted)]/50">
                  <td className="py-2.5 font-mono text-[var(--text-muted)]">{log.id}</td>
                  <td className="py-2.5 font-medium text-[var(--foreground)]">
                    {log.niche}
                  </td>
                  <td className="py-2.5">{log.platform}</td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.targetFormat}</td>
                  <td className="py-2.5">
                    <AppBadge variant={log.isSuccess ? "success" : "destructive"}>
                      {log.status}
                    </AppBadge>
                  </td>
                  <td className="py-2.5 text-[var(--text-muted)]">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
}
